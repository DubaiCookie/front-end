import type { RideInfoSocketMessage, RidesMinutesSocketMessage } from "@/types/attraction";
import type { UserQueueSocketMessage } from "@/types/queue";

const DEFAULT_WS_URL = "wss://baeminjun.store/ws/queue";
const WS_URL = import.meta.env.VITE_WS_URL ?? DEFAULT_WS_URL;

type StompHeaders = Record<string, string>;
type StompCallback = (payload: unknown) => void;

type Subscription = {
  id: string;
  destination: string;
  callback: StompCallback;
  activateDestination?: string;
};

type StompFrame = {
  command: string;
  headers: StompHeaders;
  body: string;
};

function escapeHeaderValue(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .replace(/:/g, "\\c");
}

function buildFrame(command: string, headers: StompHeaders, body = "") {
  const headerLines = Object.entries(headers)
    .map(([key, value]) => `${key}:${escapeHeaderValue(value)}`)
    .join("\n");

  return `${command}\n${headerLines}\n\n${body}\0`;
}

function parseFrame(raw: string): StompFrame | null {
  const normalized = raw.trim();
  if (!normalized) {
    return null;
  }

  const separatorIndex = normalized.indexOf("\n\n");
  const headerBlock = separatorIndex >= 0 ? normalized.slice(0, separatorIndex) : normalized;
  const body = separatorIndex >= 0 ? normalized.slice(separatorIndex + 2) : "";

  const lines = headerBlock.split("\n");
  const command = lines.shift()?.trim();
  if (!command) {
    return null;
  }

  const headers: StompHeaders = {};
  for (const line of lines) {
    if (!line) {
      continue;
    }
    const delimiterIndex = line.indexOf(":");
    if (delimiterIndex < 0) {
      continue;
    }
    const key = line.slice(0, delimiterIndex).trim();
    const value = line.slice(delimiterIndex + 1).trim();
    headers[key] = value;
  }

  return { command, headers, body };
}

class StompSocketClient {
  private socket: WebSocket | null = null;
  private isConnected = false;
  private reconnectTimer: number | null = null;
  private readonly subscriptions = new Map<string, Subscription>();
  private readonly pendingFrames: string[] = [];
  private receiveBuffer = "";
  private sequence = 0;

  private nextId(prefix: string) {
    this.sequence += 1;
    return `${prefix}-${this.sequence}`;
  }

  private connect() {
    if (this.socket && (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)) {
      return;
    }

    this.socket = new WebSocket(WS_URL);

    this.socket.addEventListener("open", () => {
      const connectFrame = buildFrame("CONNECT", {
        "accept-version": "1.2",
        "heart-beat": "10000,10000",
      });
      this.socket?.send(connectFrame);
    });

    this.socket.addEventListener("message", (event) => {
      if (typeof event.data !== "string") {
        return;
      }

      this.receiveBuffer += event.data;
      const chunks = this.receiveBuffer.split("\0");
      this.receiveBuffer = chunks.pop() ?? "";

      for (const chunk of chunks) {
        const frame = parseFrame(chunk);
        if (!frame) {
          continue;
        }
        this.handleFrame(frame);
      }
    });

    this.socket.addEventListener("close", () => {
      this.isConnected = false;
      this.socket = null;

      if (this.subscriptions.size > 0 && this.reconnectTimer === null) {
        this.reconnectTimer = window.setTimeout(() => {
          this.reconnectTimer = null;
          this.connect();
        }, 2000);
      }
    });

    this.socket.addEventListener("error", () => {
      // close event will handle reconnect lifecycle
    });
  }

  private sendRaw(frame: string) {
    if (this.isConnected && this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(frame);
      return;
    }
    this.pendingFrames.push(frame);
    this.connect();
  }

  private send(command: string, headers: StompHeaders, body = "") {
    this.sendRaw(buildFrame(command, headers, body));
  }

  private flushPendingFrames() {
    while (this.pendingFrames.length > 0) {
      const frame = this.pendingFrames.shift();
      if (!frame) {
        continue;
      }
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        this.pendingFrames.unshift(frame);
        return;
      }
      this.socket.send(frame);
    }
  }

  private resubscribeAll() {
    for (const subscription of this.subscriptions.values()) {
      this.send("SUBSCRIBE", {
        id: subscription.id,
        destination: subscription.destination,
      });
      if (subscription.activateDestination) {
        this.send("SEND", { destination: subscription.activateDestination });
      }
    }
  }

  private handleFrame(frame: StompFrame) {
    if (frame.command === "CONNECTED") {
      this.isConnected = true;
      this.resubscribeAll();
      this.flushPendingFrames();
      return;
    }

    if (frame.command === "MESSAGE") {
      const subscriptionId = frame.headers.subscription;
      const subscription = subscriptionId ? this.subscriptions.get(subscriptionId) : undefined;
      if (!subscription) {
        return;
      }

      try {
        const payload = JSON.parse(frame.body);
        subscription.callback(payload);
      } catch {
        // ignore malformed payload
      }
      return;
    }

    if (frame.command === "ERROR") {
      // let reconnect strategy handle transient errors
    }
  }

  subscribe(
    destination: string,
    callback: StompCallback,
    options?: { activateDestination?: string },
  ) {
    const id = this.nextId("sub");
    const subscription: Subscription = {
      id,
      destination,
      callback,
      activateDestination: options?.activateDestination,
    };

    this.subscriptions.set(id, subscription);
    this.connect();

    if (this.isConnected) {
      this.send("SUBSCRIBE", { id, destination });
      if (options?.activateDestination) {
        this.send("SEND", { destination: options.activateDestination });
      }
    }

    return () => {
      const exists = this.subscriptions.get(id);
      if (!exists) {
        return;
      }

      this.subscriptions.delete(id);
      if (this.isConnected) {
        this.send("UNSUBSCRIBE", { id });
      }
    };
  }
}

const client = new StompSocketClient();

export function subscribeRidesMinutes(callback: (payload: RidesMinutesSocketMessage) => void) {
  return client.subscribe("/sub/rides/minutes", (payload) => {
    callback(payload as RidesMinutesSocketMessage);
  }, {
    activateDestination: "/pub/rides/minutes",
  });
}

export function subscribeRideInfo(rideId: number, callback: (payload: RideInfoSocketMessage) => void) {
  return client.subscribe(`/sub/rides/${rideId}/info`, (payload) => {
    callback(payload as RideInfoSocketMessage);
  }, {
    activateDestination: `/pub/rides/${rideId}/info`,
  });
}

export function subscribeUserQueueStatus(userId: number, callback: (payload: UserQueueSocketMessage) => void) {
  return client.subscribe(`/sub/user/${userId}/queue-status`, (payload) => {
    callback(payload as UserQueueSocketMessage);
  }, {
    activateDestination: `/pub/user/${userId}/queue-status`,
  });
}

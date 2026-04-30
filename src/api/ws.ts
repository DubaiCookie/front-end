import type { AttractionInfoSocketMessage, AttractionsMinutesSocketMessage } from "@/types/attraction";
import type { QueueStatus, QueueStatusItem, UserQueueSocketMessage } from "@/types/queue";
import type { TicketKind } from "@/types/ticket";
import { env } from "@/utils/env";

const DEFAULT_WS_PATH = "/ws/queue";

function resolveWebSocketUrl(rawUrl: string | undefined) {
  const configuredUrl = rawUrl?.trim() || DEFAULT_WS_PATH;

  if (/^wss?:\/\//i.test(configuredUrl)) {
    return configuredUrl;
  }

  if (/^https?:\/\//i.test(configuredUrl)) {
    return configuredUrl.replace(/^http/i, "ws");
  }

  const path = configuredUrl.startsWith("/") ? configuredUrl : `/${configuredUrl}`;
  if (typeof window === "undefined") {
    return path;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}${path}`;
}

const WS_URL = resolveWebSocketUrl(env.WS_URL);

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

function normalizeTicketType(raw: string | undefined): TicketKind {
  if (!raw) {
    return "BASIC";
  }
  const upper = raw.toUpperCase();
  if (upper === "PREMIUM") {
    return "PREMIUM";
  }
  return "BASIC";
}

function normalizeQueueStatus(raw: string | undefined): QueueStatus {
  return raw?.toUpperCase() === "AVAILABLE" ? "AVAILABLE" : "WAITING";
}

function normalizeAttractionInfoPayload(payload: unknown): AttractionInfoSocketMessage {
  const obj = (payload ?? {}) as {
    attractionId?: number;
    attraction_id?: number;
    rideId?: number;
    ride_id?: number;
    waitingMinutesPremium?: number;
    waiting_minutes_premium?: number;
    waitingMinutesBasic?: number;
    waiting_minutes_basic?: number;
    queueCountPremium?: number;
    queue_count_premium?: number;
    queueCountBasic?: number;
    queue_count_basic?: number;
    waitTimes?: Array<{
      ticketType?: string;
      ticket_type?: string;
      estimatedMinutes?: number;
      estimated_minutes?: number;
      estimatedWaitMinutes?: number;
      estimated_wait_minutes?: number;
      waitingCount?: number;
      waiting_count?: number;
    }>;
  };

  const waitTimesRaw = Array.isArray(obj.waitTimes) ? obj.waitTimes : [];
  const waitTimes = waitTimesRaw.length > 0
    ? waitTimesRaw.map((wait) => ({
      ticketType: normalizeTicketType(wait.ticketType ?? wait.ticket_type),
      estimatedMinutes:
        wait.estimatedMinutes ?? wait.estimated_minutes ?? wait.estimatedWaitMinutes ?? wait.estimated_wait_minutes ?? 0,
      waitingCount: wait.waitingCount ?? wait.waiting_count ?? 0,
    }))
    : [
      {
        ticketType: "PREMIUM" as const,
        estimatedMinutes: obj.waitingMinutesPremium ?? obj.waiting_minutes_premium ?? 0,
        waitingCount: obj.queueCountPremium ?? obj.queue_count_premium ?? 0,
      },
      {
        ticketType: "BASIC" as const,
        estimatedMinutes: obj.waitingMinutesBasic ?? obj.waiting_minutes_basic ?? 0,
        waitingCount: obj.queueCountBasic ?? obj.queue_count_basic ?? 0,
      },
    ];

  return {
    attractionId: obj.attractionId ?? obj.attraction_id ?? obj.rideId ?? obj.ride_id ?? 0,
    waitTimes,
  };
}

function normalizeAttractionsMinutesPayload(payload: unknown): AttractionsMinutesSocketMessage {
  type AttractionMinutesDto = {
    attractionId?: number;
    attraction_id?: number;
    rideId?: number;
    ride_id?: number;
    estimatedMinutes?: number;
    estimated_minutes?: number;
    estimatedWaitMinutes?: number;
    estimated_wait_minutes?: number;
    waitingMinutesPremium?: number;
    waiting_minutes_premium?: number;
    waitingMinutesBasic?: number;
    waiting_minutes_basic?: number;
    queueCountPremium?: number;
    queue_count_premium?: number;
    queueCountBasic?: number;
    queue_count_basic?: number;
  };

  const obj = (payload ?? {}) as {
    attractions?: AttractionMinutesDto[];
    rides?: AttractionMinutesDto[];
    attractionId?: number;
    attraction_id?: number;
    rideId?: number;
    ride_id?: number;
    estimatedMinutes?: number;
    estimated_minutes?: number;
    estimatedWaitMinutes?: number;
    estimated_wait_minutes?: number;
    waitingMinutesPremium?: number;
    waiting_minutes_premium?: number;
    waitingMinutesBasic?: number;
    waiting_minutes_basic?: number;
    queueCountPremium?: number;
    queue_count_premium?: number;
    queueCountBasic?: number;
    queue_count_basic?: number;
  };
  const attractionsRaw = Array.isArray(obj.attractions)
    ? obj.attractions
    : Array.isArray(obj.rides)
      ? obj.rides
      : [obj];

  return {
    attractions: attractionsRaw.map((attraction) => ({
      attractionId: attraction.attractionId ?? attraction.attraction_id ?? attraction.rideId ?? attraction.ride_id ?? 0,
      waitingMinutesPremium: attraction.waitingMinutesPremium ?? attraction.waiting_minutes_premium ?? 0,
      waitingMinutesBasic: attraction.waitingMinutesBasic ?? attraction.waiting_minutes_basic ?? 0,
      queueCountPremium: attraction.queueCountPremium ?? attraction.queue_count_premium ?? 0,
      queueCountBasic: attraction.queueCountBasic ?? attraction.queue_count_basic ?? 0,
      estimatedMinutes:
        attraction.estimatedMinutes ??
        attraction.estimated_minutes ??
        attraction.waitingMinutesBasic ??
        attraction.waiting_minutes_basic ??
        attraction.estimatedWaitMinutes ??
        attraction.estimated_wait_minutes ??
        0,
    })),
  };
}

export function subscribeAttractionsMinutes(callback: (payload: AttractionsMinutesSocketMessage) => void) {
  return client.subscribe("/sub/rides/minutes", (payload) => {
    callback(normalizeAttractionsMinutesPayload(payload));
  });
}

export function subscribeAttractionInfo(attractionId: number, callback: (payload: AttractionInfoSocketMessage) => void) {
  return client.subscribe("/sub/rides/minutes", (payload) => {
    const normalized = normalizeAttractionInfoPayload(payload);
    if (normalized.attractionId === attractionId) {
      callback(normalized);
    }
  });
}

export function subscribeUserQueueStatus(userId: number, callback: (payload: UserQueueSocketMessage) => void) {
  return client.subscribe(`/sub/user/${userId}/queue-status`, (payload) => {
    callback(normalizeUserQueueSocketPayload(payload));
  });
}

function normalizeQueueStatusItem(item: unknown): QueueStatusItem {
  const obj = (item ?? {}) as {
    attractionId?: number;
    attraction_id?: number;
    rideId?: number;
    ride_id?: number;
    attractionName?: string;
    attraction_name?: string;
    rideName?: string;
    ride_name?: string;
    ticketType?: string;
    ticket_type?: string;
    status?: string;
    position?: number;
    estimatedMinutes?: number;
    estimated_minutes?: number;
    estimatedWaitMinutes?: number;
    estimated_wait_minutes?: number;
    deferCount?: number;
    defer_count?: number;
  };

  return {
    attractionId: obj.attractionId ?? obj.attraction_id ?? obj.rideId ?? obj.ride_id ?? 0,
    attractionName: obj.attractionName ?? obj.attraction_name ?? obj.rideName ?? obj.ride_name ?? "",
    ticketType: normalizeTicketType(obj.ticketType ?? obj.ticket_type),
    status: normalizeQueueStatus(obj.status),
    position: obj.position ?? 0,
    estimatedMinutes:
      obj.estimatedMinutes ?? obj.estimated_minutes ?? obj.estimatedWaitMinutes ?? obj.estimated_wait_minutes ?? 0,
    deferCount: obj.deferCount ?? obj.defer_count ?? 0,
  };
}

function normalizeUserQueueSocketPayload(payload: unknown): UserQueueSocketMessage {
  const obj = (payload ?? {}) as {
    userId?: number;
    user_id?: number;
    queues?: unknown[];
    items?: unknown[];
    status?: string;
    attractionId?: number;
    attraction_id?: number;
    rideId?: number;
    ride_id?: number;
    type?: string;
    ticketType?: string;
    ticket_type?: string;
    attractionName?: string;
    attraction_name?: string;
  };

  if (obj.status) {
    const status = obj.status.toUpperCase();
    return {
      userId: obj.userId ?? obj.user_id ?? 0,
      attractionId: obj.attractionId ?? obj.attraction_id ?? obj.rideId ?? obj.ride_id ?? 0,
      attractionName: obj.attractionName ?? obj.attraction_name,
      type: normalizeTicketType(obj.ticketType ?? obj.ticket_type ?? obj.type),
      status: status === "READY" || status === "AVAILABLE" ? "READY" : "ALMOST_READY",
    };
  }

  const queuesRaw = Array.isArray(obj.queues) ? obj.queues : obj.items ?? [];
  return {
    userId: obj.userId ?? obj.user_id ?? 0,
    queues: queuesRaw.map(normalizeQueueStatusItem),
  };
}

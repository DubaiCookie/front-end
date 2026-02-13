// WebSocket usage is intentionally disabled for now.
//
// import { env } from "@/utils/env";
//
// let socket: WebSocket | null = null;
//
// export function connectWebSocket() {
//   if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
//     return socket;
//   }
//
//   socket = new WebSocket(env.WS_URL);
//
//   socket.addEventListener("open", () => {
//     console.info("[ws] connected", env.WS_URL);
//   });
//
//   socket.addEventListener("close", () => {
//     console.info("[ws] disconnected");
//     socket = null;
//   });
//
//   socket.addEventListener("error", (event) => {
//     console.error("[ws] error", event);
//   });
//
//   return socket;
// }
//
// export function disconnectWebSocket() {
//   if (!socket) {
//     return;
//   }
//
//   socket.close();
//   socket = null;
// }
//
// export function getWebSocket() {
//   return socket;
// }

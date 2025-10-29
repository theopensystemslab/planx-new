import { toast } from "react-toastify";
import ReconnectingWebSocket from "reconnecting-websocket";
import sharedb from "sharedb/lib/client";
import type { Doc, Socket } from "sharedb/lib/sharedb";

let socket: ReconnectingWebSocket | null = null;
let connection: sharedb.Connection | null = null;

const SHAREDB_URL: string = import.meta.env.VITE_APP_SHAREDB_URL!;
const TOKEN_EXPIRY_CODE = 4001 as const;

export function initializeShareDB() {
  // Ensure we re-open connection when reloading in dev build
  const isDevBuild =
    connection &&
    (connection.state === "stopped" || connection.state === "closed");
  if (isDevBuild) {
    console.debug("[ShareDB] Stale connection found, re-initialising");
    disconnectShareDB();
  }

  // Only allow one WS connection per authenticated user
  if (connection) return;

  console.debug("[ShareDB] Initialising websocket connection...");

  socket = new ReconnectingWebSocket(SHAREDB_URL);
  connection = new sharedb.Connection(socket as unknown as Socket);

  connection.on("state", (newState, reason) => {
    console.debug(
      `[ShareDB] Connection state changed to: ${newState}. Reason: ${reason}`,
    );
  });

  socket.addEventListener("close", ({ code, reason }) => {
    if (code === TOKEN_EXPIRY_CODE && reason === "Token validation error") {
      toast.error(
        "[ShareDB error]: Session expired, redirecting to login page...",
      );
    }
  });
}

export function disconnectShareDB() {
  if (socket) {
    console.log("[ShareDB] Closing websocket connection");
    socket.close();
  }
  socket = null;
  connection = null;
}

export const getFlowDoc = (id: string): Doc => {
  initializeShareDB();
  if (!connection) throw new Error("[ShareDB] Connection failed to initialise");

  console.debug("[ShareDB] Getting flow ", id);
  return connection.get("flows", id);
};

export const subscribeToDoc = (doc: Doc): Promise<void> => {
  console.debug("[ShareDB] Connecting to", doc.id);

  return new Promise((resolve, reject) => {
    doc.subscribe((err) => {
      if (err) return reject(err);
      if (doc.type === null) {
        doc.create({ nodes: {}, edges: [] }, (createErr) => {
          if (createErr) return reject(createErr);
        });
      }

      console.debug("[ShareDB] Connected to", doc.id);
      resolve();
    });
  });
};

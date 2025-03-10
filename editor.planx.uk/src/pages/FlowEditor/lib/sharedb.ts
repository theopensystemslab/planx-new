import { toast } from "react-toastify";
import ReconnectingWebSocket from "reconnecting-websocket";
import type { Doc } from "sharedb";
import sharedb from "sharedb/lib/client";
import type { Socket } from "sharedb/lib/sharedb";

// Please see sharedb.planx.uk/server.js
// Docs: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code#value
const TOKEN_EXPIRY_CODE = 4001;

const socket = new ReconnectingWebSocket(
  import.meta.env.VITE_APP_SHAREDB_URL || "",
);

socket.addEventListener("close", ({ code, reason }) => {
  if (code === TOKEN_EXPIRY_CODE && reason === "Token expired") {
    toast.error("Session expired, redirecting to login page...", {
      toastId: "jwt_expiry_error",
      hideProgressBar: false,
      progress: undefined,
      autoClose: 2_000,
      onClose: () => (window.location.href = "/logout"),
    });
  }
});

const connection = new sharedb.Connection(socket as unknown as Socket);

export const getConnection = (id: string) => connection.get("flows", id);

export const createDoc = async (
  doc: Doc,
  initialData = { nodes: {}, edges: [] },
) => {
  return new Promise((res, rej) => {
    doc.create(initialData, (err) => {
      if (err) rej(err);
      res({});
    });
  });
};

export const connectToDB = (doc: Doc) =>
  new Promise((res, rej) => {
    doc.subscribe(async (err) => {
      console.log("subscribing to doc");
      if (err) return rej(err);
      if (doc.type === null) {
        console.log("creating doc");
        await createDoc(doc);
      }
      return res({});
    });
  });

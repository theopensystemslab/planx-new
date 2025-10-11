import { toast, ToastOptions } from "react-toastify";
import ReconnectingWebSocket from "reconnecting-websocket";
import type { Doc } from "sharedb";
import sharedb from "sharedb/lib/client";
import type { Socket } from "sharedb/lib/sharedb";

// Please see sharedb.planx.uk/server.js
// Docs: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code#value
const TOKEN_EXPIRY_CODE = 4001 as const;

const createWSConnection = () => {
  const socket = new ReconnectingWebSocket(
    import.meta.env.VITE_APP_SHAREDB_URL || "",
  );

  const toastConfig: Partial<ToastOptions> = {
    hideProgressBar: false,
    progress: undefined,
    autoClose: 4_000,
    onClose: () => (window.location.href = "/logout"),
  };

  /** Listen for expired tokens events and force logout */
  socket.addEventListener("close", ({ code, reason }) => {
    if (code === TOKEN_EXPIRY_CODE && reason === "Token validation error") {
      toast.error(
        "[ShareDB error]: Session expired, redirecting to login page...",
        {
          toastId: "sharedb_jwt_expiry",
          ...toastConfig,
        },
      );
    }
  });

  /** Fallback for unhandled ShareDB errors */
  socket.addEventListener("error", (errorEvent) => {
    console.error("Unhandled ShareDB error: ", { errorEvent });

    // Only display a single toast at a time
    if (toast.isActive("sharedb_jwt_expiry")) return;

    toast.error(
      "[ShareDB error]: Unhandled error, redirecting to login page...",
      {
        toastId: "sharedb_error",
        ...toastConfig,
      },
    );
  });

  return socket;
};

const getShareDBConnection = (): sharedb.Connection => {
  const socket = createWSConnection();
  return new sharedb.Connection(socket as unknown as Socket);
};

export const getFlowConnection = (id: string) =>
  getShareDBConnection().get("flows", id);

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

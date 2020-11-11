import ReconnectingWebSocket from "reconnecting-websocket";
import sharedb from "sharedb/lib/client";

const socket = new ReconnectingWebSocket(
  (import.meta as any).env.REACT_APP_SHAREDB_URL
);

const connection = new sharedb.Connection(socket, {});

export const getConnection = (id) => connection.get("flows", id);

export const createDoc = async (
  doc,
  initialData = { nodes: {}, edges: [] }
) => {
  return new Promise(async (res, rej) => {
    doc.create(initialData, (err) => {
      if (err) rej(err);
      res();
    });
  });
};

export const connectToDB = (doc) =>
  new Promise((res, rej) => {
    doc.subscribe(async (err) => {
      console.log("subscribing to doc");
      if (err) return rej(err);
      if (doc.type === null) {
        console.log("creating doc");
        await createDoc(doc);
      }
      return res();
    });
  });

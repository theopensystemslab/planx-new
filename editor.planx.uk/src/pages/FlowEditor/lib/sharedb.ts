import ReconnectingWebSocket from "reconnecting-websocket";
import type { Doc } from "sharedb";
import sharedb from "sharedb/lib/client";
import type { Socket } from "sharedb/lib/sharedb";

const socket = new ReconnectingWebSocket(
  process.env.REACT_APP_SHAREDB_URL || ""
);

const connection = new sharedb.Connection(socket as unknown as Socket);

export const getConnection = (id: string) => connection.get("flows", id);

export const createDoc = async (
  doc: Doc,
  initialData = { nodes: {}, edges: [] }
) => {
  return new Promise(async (res, rej) => {
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

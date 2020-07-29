// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import WebSocketJSONStream from "@teamwork/websocket-json-stream";
import "@testing-library/jest-dom/extend-expect";
import ShareDB from "sharedb";
import { Server } from "ws";

let ws;

beforeAll(() => {
  const sharedb = new ShareDB();
  ws = new Server({
    port: Number(process.env.REACT_APP_SHAREDB_URL.split(":").pop()),
  });

  ws.on("connection", (ws) => {
    sharedb.listen(new WebSocketJSONStream(ws));
  });

  console.log(`sharedb running on ${process.env.REACT_APP_SHAREDB_URL}`);
});

afterAll(() => {
  console.log("closing sharedb");
  ws.close();
});

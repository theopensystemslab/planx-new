import { Server } from "http";
import app from "./routes";

const server = new Server(app);

server.keepAliveTimeout = 30000; // 30s
server.headersTimeout = 35000; // 35s

export default server;

// declaring User in a d.ts file is overwritten by other files
declare global {
  namespace Express {
    interface User {
      jwt: string;
      sub?: string;
    }
  }
}

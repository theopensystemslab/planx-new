import cors from "cors";
import { json } from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";
import noir from "pino-noir";
import helmet from "helmet";
import { apiLimiter } from "../rateLimit";

const init = express.Router();

init.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

init.use(
  cors({
    credentials: true,
    methods: "*",
  })
);

init.use(json({ limit: "100mb" }));

// Converts req.headers.cookie: string, to req.cookies: Record<string, string>
init.use(cookieParser());

if (process.env.NODE_ENV !== "test") {
  init.use(
    require("express-pino-logger")({
      serializers: noir(["req.headers.authorization"], "**REDACTED**"),
    })
  );
}

// Rate limit requests per IP address
init.use(apiLimiter);

// Secure Express by setting various HTTP headers
init.use(helmet());

export default init;

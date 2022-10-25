import cors from "cors";
import { json } from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";
import noir from "pino-noir";
import helmet from "helmet";
import { apiLimiter } from "../rateLimit";

const app = express();

app.set("trust proxy", 1);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(
  cors({
    credentials: true,
    methods: "*",
  })
);

app.use(json({ limit: "100mb" }));

// Converts req.headers.cookie: string, to req.cookies: Record<string, string>
app.use(cookieParser());

if (process.env.NODE_ENV !== "test") {
  app.use(
    require("express-pino-logger")({
      serializers: noir(["req.headers.authorization"], "**REDACTED**"),
    })
  );
}

// Rate limit requests per IP address
app.use(apiLimiter);

// Secure Express by setting various HTTP headers
app.use(helmet());

export default app;

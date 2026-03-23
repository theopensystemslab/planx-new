import cors, { type CorsOptions } from "cors";
import type { RequestHandler } from "express";

const checkAllowedOrigins: CorsOptions["origin"] = (origin, callback) => {
  if (!origin) return callback(null, true);

  const isTest = process.env.NODE_ENV === "test";
  const localDevEnvs =
    /^http:\/\/(127\.0\.0\.1|localhost):(3000|5173|6006|7007|4321)$/;
  const isDevelopment =
    process.env.APP_ENVIRONMENT === "development" || localDevEnvs.test(origin);
  const allowList = process.env.CORS_ALLOWLIST?.split(", ") || [];
  const isAllowed = Boolean(allowList.includes(origin));
  const isMapDocs = Boolean(origin.endsWith("oslmap.netlify.app"));

  isTest || isDevelopment || isAllowed || isMapDocs
    ? callback(null, true)
    : callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
};

const apiCors = cors({
  credentials: true,
  methods: "*",
  origin: checkAllowedOrigins,
  allowedHeaders: [
    "Accept",
    "Authorization",
    "Content-Type",
    "Origin",
    "X-Requested-With",
  ],
  exposedHeaders: ["Content-Disposition"],
});

const skipApiCors = ["/proxy/ordnance-survey"];

/**
 * App-level CORS middleware. Applies {@link apiCors} to all routes except those
 * that define their own CORS policy (e.g. OS proxy routes which permit null origins).
 */
export const defaultCors: RequestHandler = (req, res, next) => {
  if (skipApiCors.some((path) => req.path.startsWith(path))) return next();
  return apiCors(req, res, next);
};

/**
 * Extends {@link checkAllowedOrigins} to additionally permit null origins.
 *
 * Map tile requests come from two sources that don't require credentials -
 * - file:// HTML reports (e.g. generated overview.html) — browsers assign these a "null" origin
 * - The public-facing PlanX interface
 *
 * Null origins are safe to allow here specifically because credentials are disabled
 */
const checkAllowedOriginsForOSRequests: CorsOptions["origin"] = (
  origin,
  callback,
) => {
  if (!origin || origin === "null") return callback(null, true);
  return checkAllowedOrigins(origin, callback);
};

export const osCors = cors({
  credentials: false,
  methods: "*",
  origin: checkAllowedOriginsForOSRequests,
  allowedHeaders: [
    "Accept",
    "Authorization",
    "Content-Type",
    "Origin",
    "X-Requested-With",
  ],
});

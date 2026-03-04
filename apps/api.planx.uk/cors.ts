import cors, { type CorsOptions } from "cors";

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

export const apiCors = cors({
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
});

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
  origin: checkAllowedOriginsForOSRequests,
});

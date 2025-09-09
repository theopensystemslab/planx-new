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

export const defaultCorsOptions: CorsOptions = {
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
};

/**
 * Do not block local file access to tile APIs (i.e. from HTML file running in the browser)
 */
export const osCors = cors({
  ...defaultCorsOptions,
  origin: (origin, callback) => {
    if (origin === "null") return callback(null, true);

    // Defer to default checkAllowedOrigins function
    return (defaultCorsOptions.origin as any)(origin, callback);
  },
});

export const apiCors = cors(defaultCorsOptions);

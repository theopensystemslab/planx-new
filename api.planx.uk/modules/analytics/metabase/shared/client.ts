import axios from "axios";
import type {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

// Custom error class for Metabase-specific errors
export class MetabaseError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown,
  ) {
    super(message);
    this.name = "MetabaseError";
  }
}

interface MetabaseConfig {
  baseURL: string;
  apiKey: string;
  timeout?: number;
  retries?: number;
}

// Validate environment variables
export const validateConfig = (): MetabaseConfig => {
  const baseURL = process.env.METABASE_URL_EXT;
  const apiKey = process.env.METABASE_API_KEY;

  const METABASE_TIMEOUT = 30_000;
  const METABASE_MAX_RETRIES = 3;

  assert(baseURL, "Missing environment variable 'METABASE_URL_EXT'");
  assert(apiKey, "Missing environment variable 'METABASE_API_KEY'");

  return {
    baseURL,
    apiKey,
    timeout: METABASE_TIMEOUT,
    retries: METABASE_MAX_RETRIES,
  };
};

// Extended request config to include retry count
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  retryCount?: number;
}

// Create and configure Axios instance
export const createMetabaseClient = (): AxiosInstance => {
  const config = validateConfig();

  const client = axios.create({
    baseURL: config.baseURL,
    headers: {
      "X-API-Key": config.apiKey,
      "Content-Type": "application/json",
    },
    timeout: config.timeout,
  });

  client.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as ExtendedAxiosRequestConfig;

      if (!originalRequest) {
        throw new MetabaseError("No request config available");
      }

      // Initialise retry count if not present
      if (typeof originalRequest.retryCount === "undefined") {
        originalRequest.retryCount = 0;
      }

      // Handle retry logic
      if (error.response) {
        // Retry on 5xx errors
        if (
          error.response.status >= 500 &&
          originalRequest.retryCount < (config.retries ?? 3)
        ) {
          originalRequest.retryCount++;
          return client.request(originalRequest);
        }

        // Transform error response
        const errorMessage =
          typeof error.response.data === "object" &&
          error.response.data !== null &&
          "message" in error.response.data
            ? String(error.response.data.message)
            : "Metabase request failed";

        throw new MetabaseError(
          errorMessage,
          error.response.status,
          error.response.data,
        );
      }

      // Handle network errors
      if (error.request) {
        throw new MetabaseError(
          "Network error occurred",
          undefined,
          error.request,
        );
      }

      // Handle other errors
      throw new MetabaseError(error.message);
    },
  );

  return client;
};

// Export both client and instance with delayed instantiation for test purposes
export let metabaseClient: AxiosInstance;

export const initializeMetabaseClient = () => {
  metabaseClient = createMetabaseClient();
  return metabaseClient;
};

import axios from "axios";
import type {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import dotenv from "dotenv";

dotenv.config();

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
const validateConfig = (): MetabaseConfig => {
  const baseURL = process.env.METABASE_BASE_URL;
  const apiKey = process.env.METABASE_API_KEY;

  if (!baseURL) {
    throw new Error(
      "METABASE_BASE_URL is not defined in environment variables",
    );
  }
  if (!apiKey) {
    throw new Error("METABASE_API_KEY is not defined in environment variables");
  }

  return {
    baseURL,
    apiKey,
    timeout: parseInt(process.env.METABASE_TIMEOUT ?? "30000"), // 30 second default timeout
    retries: parseInt(process.env.METABASE_MAX_RETRIES ?? "3"), // 3 default retries
  };
};

// Extended request config to include retry count
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  retryCount?: number;
}

// Create config and export URL for public URL generation
const config = validateConfig();
export const METABASE_BASE_URL = config.baseURL;

// Create and configure Axios instance
export const createMetabaseClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: config.baseURL,
    headers: {
      "X-API-Key": config.apiKey,
      "Content-Type": "application/json",
    },
    timeout: config.timeout,
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Could add request logging here
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

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
          return client(originalRequest);
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

// Export singleton instance
export const metabaseClient = createMetabaseClient();

// Health check function
export const checkMetabaseConnection = async (): Promise<boolean> => {
  try {
    const response = await metabaseClient.get("/api/user/current");
    return response.status === 200;
  } catch (error) {
    console.error("Metabase health check failed:", error);
    return false;
  }
};

export default metabaseClient;

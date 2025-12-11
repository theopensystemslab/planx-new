import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useStore } from "pages/FlowEditor/lib/store";
import { toast } from "react-toastify";

export interface APIError<T> {
  message: string;
  statusCode: number;
  data: T;
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Append the user's JWT to all requests via a request interceptor
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useStore.getState().jwt;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Standard error handling via a response interceptor
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const statusCode = error.response?.status;

    let message = error.message || "An unexpected error occurred";
    let toastId: string | undefined;

    switch (statusCode) {
      case 401:
        message = "Unauthenticated";
        toastId = "api_unauthenticated_error";
        break;

      case 403:
        message = "Unauthorised";
        toastId = "api_unauthorised_error";
        break;

      case 429:
        message = "Rate limit exceeded";
        toastId = "api_rate_limit_error";
        break;

      case 502:
      case 504:
        message = "Timeout - operation did not complete";
        toastId = "api_timeout_error";
        break;

      default:
        console.error("[API Error]:", {
          message,
          statusCode,
          data: error.response?.data,
        });
        break;
    }

    if (toastId) {
      toast.error(`[API error]: ${message}`, {
        toastId,
        hideProgressBar: false,
        autoClose: 4_000,
      });
    }

    return Promise.reject({
      message,
      statusCode,
      data: error.response?.data,
    } as APIError<unknown>);
  },
);

export default apiClient;

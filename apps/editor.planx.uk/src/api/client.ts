import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useStore } from "pages/FlowEditor/lib/store";
import { toast } from "react-toastify";

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
    const status = error.response?.status;

    if (status === 401) {
      toast.error("[API error]: Unauthenticated", {
        toastId: "api_unauthenticated_error",
        hideProgressBar: false,
        autoClose: 4_000,
      });

      return Promise.reject({
        message: "Unauthenticated",
        statusCode: 401,
      });
    }

    if (status === 403) {
      toast.error("[API error]: Unauthorised", {
        toastId: "api_unauthorised_error",
        hideProgressBar: false,
        autoClose: 4_000,
      });

      return Promise.reject({
        message: "Unauthorised",
        statusCode: 403,
      });
    }

    const apiError = {
      message:
        error.message || error.response?.data || "An unexpected error occurred",
      statusCode: status,
      data: error.response?.data,
    };

    console.error("[API Error]:", apiError);
    return Promise.reject(apiError);
  },
);

export default apiClient;

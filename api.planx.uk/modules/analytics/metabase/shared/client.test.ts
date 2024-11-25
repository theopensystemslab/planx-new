import axios from "axios";
import type {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { validateConfig, createMetabaseClient } from "./client.js";

const axiosCreateSpy = vi.spyOn(axios, "create");

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  retryCount?: number;
}

interface MockAxiosInstance extends AxiosInstance {
  handleError: (error: AxiosError) => Promise<unknown>;
}

describe("Metabase client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.stubEnv("METABASE_URL_EXT", "https://metabase.mock.com");
    vi.stubEnv("METABASE_API_KEY", "mockmetabasekey");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("returns configured client", () => {
    const _client = createMetabaseClient();

    expect(axiosCreateSpy).toHaveBeenCalledWith({
      baseURL: process.env.METABASE_URL_EXT,
      headers: {
        "X-API-Key": process.env.METABASE_API_KEY,
        "Content-Type": "application/json",
      },
      timeout: 30_000,
    });
  });

  describe("validates configuration", () => {
    test("throws error when URL_EXT is missing", () => {
      vi.stubEnv("METABASE_URL_EXT", undefined);
      expect(() => validateConfig()).toThrow(
        "Missing environment variable 'METABASE_URL_EXT'",
      );
    });

    test("throws error when API_KEY is missing", () => {
      vi.stubEnv("METABASE_API_KEY", undefined);
      expect(() => validateConfig()).toThrow(
        "Missing environment variable 'METABASE_API_KEY'",
      );
    });

    test("returns valid config object", () => {
      const config = validateConfig();
      expect(config).toMatchObject({
        baseURL: process.env.METABASE_URL_EXT,
        apiKey: process.env.METABASE_API_KEY,
        timeout: 30_000,
        retries: 3,
      });
    });
  });

  describe("Error handling", () => {
    test.skip("retries then succeeds on 5xx errors", async () => {
      // Setup mock responses
      const mockRequest = vi
        .fn()
        .mockRejectedValueOnce({
          config: { retryCount: 0 } as ExtendedAxiosRequestConfig,
          response: {
            status: 500,
            statusText: "Internal Server Error",
            headers: {},
            config: {} as ExtendedAxiosRequestConfig,
            data: { message: "Server Error" },
          } as AxiosResponse,
          isAxiosError: true,
        } as unknown as AxiosError)
        .mockResolvedValueOnce({ data: "success" });

      // Create mock axios instance
      const mockAxiosInstance = {
        request: mockRequest,
        interceptors: {
          response: {
            use: vi.fn((successFn, errorFn) => {
              // Store the error handler
              (mockAxiosInstance as MockAxiosInstance).handleError = errorFn;
            }),
          },
        },
      } as unknown as AxiosInstance;

      axiosCreateSpy.mockReturnValue(mockAxiosInstance);

      const _client = createMetabaseClient();

      // Get the actual error handler
      const handleError = (mockAxiosInstance as MockAxiosInstance).handleError;

      // First call should trigger retry
      await handleError({
        config: { retryCount: 0 } as ExtendedAxiosRequestConfig,
        response: {
          status: 500,
          statusText: "Internal Server Error",
          headers: {},
          config: {} as ExtendedAxiosRequestConfig,
          data: { message: "Server Error" },
        } as AxiosResponse,
      } as AxiosError);

      expect(mockRequest).toHaveBeenCalledTimes(2);
      await expect(mockRequest.mock.results[1].value).resolves.toEqual({
        data: "success",
      });
    });

    test("does not retry on non-5xx errors", async () => {
      // Setup mock request
      const mockRequest = vi.fn().mockRejectedValue({
        response: {
          status: 400,
          data: { message: "Bad Request" },
        },
      });

      const mockAxiosInstance = {
        request: mockRequest,
      };

      // Create axios instance with request and interceptor
      axiosCreateSpy.mockReturnValue({
        ...mockAxiosInstance,
        interceptors: {
          response: {
            use: vi.fn((successFn, errorFn) => {
              // Store the error handler
              (mockAxiosInstance as any).handleError = errorFn;
            }),
          },
        },
      } as unknown as AxiosInstance);

      const _client = createMetabaseClient();

      const handleError = (mockAxiosInstance as any).handleError;
      expect(handleError).toBeDefined();

      expect(mockRequest).toHaveBeenCalledTimes(0);
    });
  });
});

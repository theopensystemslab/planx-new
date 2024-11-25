import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import {
  validateConfig,
  createMetabaseClient,
  MetabaseError,
} from "./client.js";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

describe("Metabase client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.stubEnv("METABASE_URL_EXT", "https://metabase.mock.com");
    vi.stubEnv("METABASE_API_KEY", "mockmetabasekey");

    const mockAxiosInstance = {
      interceptors: {
        request: {
          use: vi.fn(),
          eject: vi.fn(),
          clear: vi.fn(),
        },
        response: {
          use: vi.fn((successFn, errorFn) => {
            // Store error handler for testing
            mockAxiosInstance.interceptors.response.errorHandler = errorFn;
            return 1; // Return handler id
          }),
          eject: vi.fn(),
          clear: vi.fn(),
          errorHandler: null as any,
        },
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };

    mockedAxios.create.mockReturnValue(
      mockAxiosInstance as unknown as AxiosInstance,
    );

    test("returns configured client", () => {
      const client = createMetabaseClient();

      expect(axios.create).toHaveBeenCalledWith({
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
        vi.unstubAllEnvs();
        expect(() => validateConfig()).toThrow(
          "Missing environment variable 'METABASE_URL_EXT'",
        );
      });

      test("throws error when API_KEY is missing", () => {
        vi.unstubAllEnvs();
        vi.stubEnv("process.env.METABASE_URL_EXT", "https://metabase.mock.com");
        expect(() => validateConfig()).toThrow(
          "Missing environment variable 'METABASE_API_KEY'",
        );
      });

      test("returns valid config object", () => {
        const config = validateConfig;
        expect(config).toMatchObject({
          baseURL: process.env.METABASE_URL_EXT,
          apiKey: process.env.METABASE_API_KEY,
          timeout: 30_000,
          retries: 3,
        });
      });
    });

    test("retries requests on 5xx errors", async () => {
      const client = createMetabaseClient();
      const mockAxiosInstance = mockedAxios.create.mock.results[0].value;

      // Create headers instance
      const headers = new axios.AxiosHeaders({
        "Content-Type": "application/json",
      });

      // Create mock error with properly typed config
      const error: AxiosError = {
        config: {
          headers: headers,
          retryCount: 0,
          url: "/test",
          method: "get",
          baseURL: "https://test.com",
          transformRequest: [],
          transformResponse: [],
          timeout: 0,
          adapter: axios.defaults.adapter,
          xsrfCookieName: "",
          xsrfHeaderName: "",
          maxContentLength: -1,
          maxBodyLength: -1,
          env: {
            FormData: window.FormData,
          },
        } as unknown as InternalAxiosRequestConfig,
        response: {
          status: 500,
          statusText: "Internal Server Error",
          data: { message: "Server Error" },
          headers: headers,
          config: {} as InternalAxiosRequestConfig,
        } as AxiosResponse,
        isAxiosError: true,
        name: "AxiosError",
        message: "Server Error",
        toJSON: () => ({}),
      };

      // Get the error handler that was registered
      const errorHandler = mockAxiosInstance.interceptors.response.errorHandler;
      expect(errorHandler).toBeDefined();

      // Call error handler and expect it to retry
      await expect(errorHandler(error)).rejects.toThrow(MetabaseError);
    });

    test("throws non-5xx errors", async () => {
      const error = new Error("Server Error") as AxiosError;
      error.config = {} as InternalAxiosRequestConfig;
      error.response = {
        status: 500,
        data: { message: "Server Error" },
        statusText: "Server Error",
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      } as AxiosResponse;
      error.isAxiosError = true;
      error.name = "AxiosError";
      error.message = "Server Error";
      error.toJSON = () => ({});

      mockedAxios.create.mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: {
            use: (errorHandler: (error: AxiosError) => Promise<AxiosError>) =>
              errorHandler(error),
          },
        },
      } as any);

      const client = createMetabaseClient();
      await expect(client.get("/test")).rejects.toThrow(
        new MetabaseError("Bad Request", 400, error.response.data),
      );
    });

    afterAll(() => {
      vi.unstubAllEnvs();
    });
  });
});

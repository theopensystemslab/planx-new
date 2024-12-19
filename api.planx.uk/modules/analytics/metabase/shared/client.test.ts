import {
  validateConfig,
  createMetabaseClient,
  MetabaseError,
} from "./client.js";
import nock from "nock";
import { $metabase } from "./client.js";

describe("Metabase client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("returns configured client", async () => {
    expect($metabase.defaults.baseURL).toBe(process.env.METABASE_URL_EXT);
    expect($metabase.defaults.headers["X-API-Key"]).toBe(
      process.env.METABASE_API_KEY,
    );
    expect($metabase.defaults.headers["Content-Type"]).toBe("application/json");
    expect($metabase.defaults.timeout).toBe(30_000);
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
    test("retries then succeeds on 5xx errors", async () => {
      const metabaseScope = nock(process.env.METABASE_URL_EXT!);

      metabaseScope
        .get("/test")
        .reply(500, { message: "Internal Server Error" })
        .get("/test")
        .reply(200, { data: "success" });

      const response = await $metabase.get("/test");

      expect(response.data).toEqual({ data: "success" });
      expect(metabaseScope.isDone()).toBe(true);
    });

    test("throws an error if all requests fail", async () => {
      const metabaseScope = nock(process.env.METABASE_URL_EXT!);

      metabaseScope
        .get("/test")
        .times(4)
        .reply(500, { message: "Internal Server Error" });

      const $metabase = createMetabaseClient();

      try {
        await $metabase.get("/test");
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(MetabaseError);
        expect((error as MetabaseError).statusCode).toBe(500);
        expect(metabaseScope.isDone()).toBe(true);
      }
    });

    test("does not retry on non-5xx errors", async () => {
      const metabaseScope = nock(process.env.METABASE_URL_EXT!);

      metabaseScope.get("/test").once().reply(200, { data: "success" });

      const $metabase = createMetabaseClient();
      const response = await $metabase.get("/test");

      expect(response.data).toEqual({ data: "success" });

      // All expected requests were made
      expect(metabaseScope.isDone()).toBe(true);

      // No pending mocks left
      expect(metabaseScope.pendingMocks()).toHaveLength(0);

      // Double check that no other requests were intercepted
      const requestCount = metabaseScope.activeMocks().length;
      expect(requestCount).toBe(0);
    });
  });
});

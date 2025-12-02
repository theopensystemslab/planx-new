import { getS3KeyFromURL, s3Factory } from "./utils.js";

describe("s3 Factory", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("returns Minio config for local development", async () => {
    const s3 = s3Factory();

    // Minio should be set up as a custom endpoint
    expect(s3.config.endpoint).toBeDefined();

    const endpoint = await s3.config.endpoint!();

    expect(endpoint.hostname).toBe("minio");
  });

  ["pizza", "staging", "production"].forEach((env) => {
    it(`does not use Minio config on ${env} environment`, async () => {
      vi.stubEnv("NODE_ENV", env);

      const s3 = s3Factory();

      // No custom endpoint used
      expect(s3.config.endpoint).toBeUndefined();
    });
  });
});

describe("getS3KeyFromURL()", () => {
  it("converts a PlanX API URL to an S3 key", () => {
    const url = "https://api.planx.dev/file/private/someKey/someFile";
    expect(getS3KeyFromURL(url)).toBe("someKey/someFile");
  });

  it("handles URI decoding as expected", () => {
    const url =
      "https://api.planx.dev/file/private/someKey/some%20file%20with%20(special)%20%24%25%26()!%20characters";
    expect(getS3KeyFromURL(url)).toBe(
      "someKey/some file with (special) $%&()! characters",
    );
  });

  it("throws an error if the input is not a valid URL", () => {
    const badURL = "this is not a url";
    expect(() => getS3KeyFromURL(badURL)).toThrow();
  });
});

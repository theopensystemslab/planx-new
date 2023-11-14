import { getS3KeyFromURL, s3Factory } from "./utils";

describe("s3 Factory", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("returns Minio config for local development", () => {
    expect(s3Factory()).toHaveProperty("endpoint.host", "minio");
  });

  ["pizza", "staging", "production"].forEach((env) => {
    it(`does not use Minio config on ${env} environment`, () => {
      process.env.NODE_ENV = env;
      expect(s3Factory()).toHaveProperty(
        "endpoint.host",
        "s3.eu-west-2.amazonaws.com",
      );
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

import { s3Factory } from "./utils";

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

  ["pizza", "staging", "production"].forEach(env => {
    it(`does not use Minio config on ${env} environment`, () => {
      process.env.NODE_ENV = env;
      expect(s3Factory()).toHaveProperty("endpoint.host", "s3.eu-west-2.amazonaws.com");
    });
  });
})
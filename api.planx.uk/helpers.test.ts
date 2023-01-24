import { getEnvironment } from "./helpers";

describe("getEnvironment function", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test("Production env", () => {
    process.env.API_URL_EXT = "https://api.editor.planx.uk/"
    expect(getEnvironment()).toBe("Production");
  });
  
  test("Staging env", () => {
    process.env.API_URL_EXT = "https://api.editor.planx.dev/"
    expect(getEnvironment()).toBe("Staging");
  });

  test("Pizza env", () => {
    process.env.API_URL_EXT = "https://api.123.planx.pizza/"
    expect(getEnvironment()).toBe("Pizza 123");
  });

  test("Development env", () => {
    process.env.API_URL_EXT = "localhost:7002"
    expect(getEnvironment()).toBe("Development");
  });
})
import { getFormattedEnvironment } from "./helpers";

describe("getEnvironment function", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test("Production env", () => {
    process.env.NODE_ENV = "production";
    expect(getFormattedEnvironment()).toBe("Production");
  });

  test("Staging env", () => {
    process.env.NODE_ENV = "staging";
    expect(getFormattedEnvironment()).toBe("Staging");
  });

  test("Pizza env", () => {
    process.env.NODE_ENV = "pizza";
    process.env.API_URL_EXT = "https://api.123.planx.pizza/";
    expect(getFormattedEnvironment()).toBe("Pizza 123");
  });

  test("Development env", () => {
    process.env.NODE_ENV = "development";
    expect(getFormattedEnvironment()).toBe("Development");
  });
})
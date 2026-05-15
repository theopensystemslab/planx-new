import { getFlowData, getFormattedEnvironment, isLiveEnv } from "./helpers.js";
import { queryMock } from "./tests/graphqlQueryMock.js";

describe("getFormattedEnvironment() function", () => {
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
    expect(getFormattedEnvironment()).toBe("Local");
  });
});

describe("isLiveEnv() function", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("returns true for live environments", () => {
    ["pizza", "staging", "production"].forEach((env) => {
      process.env.NODE_ENV = env;
      expect(isLiveEnv()).toBe(true);
    });
  });

  it("returns false for other environments", () => {
    ["", undefined, "test", "development"].forEach((env) => {
      process.env.NODE_ENV = env;
      expect(isLiveEnv()).toBe(false);
    });
  });
});

describe("getFlowData() function", () => {
  it("throws an error if a flow is not found", async () => {
    queryMock.mockQuery({
      name: "GetFlowData",
      variables: {
        id: "child-id",
      },
      data: {
        flow: null,
      },
    });

    await expect(getFlowData("child-id")).rejects.toThrow();
  });
});

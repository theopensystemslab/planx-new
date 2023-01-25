import { Notifier } from "@airbrake/browser";

jest.mock("@airbrake/browser");

describe("logger", () => {
  const originalEnv = process.env;
  let logSpy, windowSpy;

  beforeEach(() => {
    process.env = originalEnv;
    logSpy = jest.spyOn(console, "log").mockImplementation();
    windowSpy = jest.spyOn(window, "window", "get");
  });

  afterEach(() => {
    jest.resetModules();
    Notifier.mockRestore();
    logSpy.mockRestore();
    windowSpy.mockRestore();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test("Notifier is configured in a production-like environment", () => {
    windowSpy.mockImplementation(() => ({
      location: { host: "blah.planx.uk" },
    }));
    process.env = Object.assign({
      NODE_ENV: "production",
      REACT_APP_AIRBRAKE_PROJECT_ID: "1",
      REACT_APP_AIRBRAKE_PROJECT_KEY: "a",
    });
    // instantiate the logger after mocks and env variables set
    const { logger } = require("./airbrake");
    expect(Notifier).toHaveBeenCalledWith({
      projectId: 1,
      projectKey: "a",
      environment: "production",
    });
    logger.notify({ some: "value" });
    expect(Notifier.prototype.notify).toHaveBeenCalledWith({
      some: "value",
    });
  });

  test("Notifier is not configured for development environments", () => {
    process.env = Object.assign({
      DEBUG: "true",
    });
    // instantiate the logger after env variables set
    const { logger } = require("./airbrake");
    expect(Notifier).not.toHaveBeenCalled();
    logger.notify({ some: "value" });
    expect(logSpy).toHaveBeenCalledWith({ some: "value" });
  });
});

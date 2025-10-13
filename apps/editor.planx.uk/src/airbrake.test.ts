import { Notifier } from "@airbrake/browser";
import { MockInstance, vi } from "vitest";

vi.mock("@airbrake/browser");

// Instantiate the logger after mocks and env variables set
const instantiateLogger = async () => {
  const { logger } = await import("./airbrake");
  return logger;
};

describe("logger", () => {
  let logSpy: MockInstance;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    vi.resetModules();
  });

  afterEach(() => {
    logSpy.mockRestore();
    vi.mocked(Notifier).mockClear();
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  test("Notifier is configured in a production-like environment", async () => {
    Object.defineProperty(window, "location", {
      value: { host: "editor.planx.uk" },
      writable: true,
    });

    vi.stubEnv("VITE_APP_ENV", "production");
    vi.stubEnv("VITE_APP_AIRBRAKE_PROJECT_ID", "1");
    vi.stubEnv("VITE_APP_AIRBRAKE_PROJECT_KEY", "a");

    const logger = await instantiateLogger();

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

  test("Notifier is not configured for development environments", async () => {
    vi.stubEnv("VITE_APP_ENV", "development");

    const logger = await instantiateLogger();

    expect(Notifier).not.toHaveBeenCalled();

    logger.notify({ some: "value" });
    expect(logSpy).toHaveBeenCalledWith({ some: "value" });
  });

  test("logs are suppressed when SUPPRESS_LOGS is set", async () => {
    vi.stubEnv("SUPPRESS_LOGS", "true");
    const logger = await instantiateLogger();

    expect(Notifier).not.toHaveBeenCalled();

    logger.notify({ some: "value" });
    expect(logSpy).not.toHaveBeenCalled();
  });
});

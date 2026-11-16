import nock from "nock";

import { LoggingNotifier } from "./airbrake.js";

const PROJECT_ID = 123;

const createNotifier = () =>
  new LoggingNotifier({
    projectId: PROJECT_ID,
    projectKey: "test-key",
    environment: "test",
    // Avoid background requests and timers unrelated to sending notices
    remoteConfig: false,
    performanceStats: false,
    queryStats: false,
    queueStats: false,
  });

const noticesEndpoint = () =>
  nock("https://api.airbrake.io")
    .post(`/api/v3/projects/${PROJECT_ID}/notices`)
    .query({ key: "test-key" });

describe("LoggingNotifier", () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    nock.cleanAll();
    vi.restoreAllMocks();
  });

  it("does not log when the notice is delivered", async () => {
    const scope = noticesEndpoint().reply(201, {
      id: "abc",
      url: "https://example.com",
    });

    const notice = await createNotifier().notify(new Error("Oops"));

    expect(scope.isDone()).toBe(true);
    expect(notice.id).toBe("abc");
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("logs when Airbrake rejects the notice", async () => {
    const scope = noticesEndpoint().reply(
      403,
      "<html><body><h1>403 Forbidden</h1></body></html>",
      { "Content-Type": "text/html" },
    );

    const notice = await createNotifier().notify(new Error("Oops"));

    expect(scope.isDone()).toBe(true);
    expect(notice.error).toBeDefined();
    expect(consoleError).toHaveBeenCalledWith(
      "Failed to send error to Airbrake",
      {
        reason: expect.any(String),
        unreportedErrors: [{ type: "Error", message: "Oops" }],
      },
    );
  });

  it("does not log errors deliberately dropped by a filter", async () => {
    const notifier = createNotifier();
    notifier.addFilter(() => null);

    const notice = await notifier.notify(new Error("Oops"));

    expect(notice.error?.message).toBe("airbrake: error is filtered");
    expect(consoleError).not.toHaveBeenCalled();
  });
});

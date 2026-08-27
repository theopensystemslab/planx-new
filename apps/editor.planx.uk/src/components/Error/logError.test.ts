import { logger } from "airbrake";
import type { ErrorInfo } from "react";
import { vi } from "vitest";

import { GraphError } from "./GraphError";
import { logError } from "./logError";

vi.mock("airbrake", () => ({
  logger: {
    notify: vi.fn(),
  },
}));

const info: ErrorInfo = {
  componentStack: "\n    at Widget\n    at Dashboard",
};

describe("logError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reports non-Graph errors to Airbrake with the component stack", () => {
    const error = new Error("Something broke");

    logError(error, info);

    expect(logger.notify).toHaveBeenCalledTimes(1);
    expect(logger.notify).toHaveBeenCalledWith({
      error,
      params: { componentStack: info.componentStack },
    });
  });

  it("reports non-Error thrown values (so they are no longer silently 'undefined')", () => {
    logError(undefined, info);

    expect(logger.notify).toHaveBeenCalledTimes(1);
    expect(logger.notify).toHaveBeenCalledWith({
      error: undefined,
      params: { componentStack: info.componentStack },
    });
  });

  it("does not report GraphErrors (shown to the user via GraphErrorComponent)", () => {
    logError(new GraphError("nodeMustFollowFindProperty"), info);

    expect(logger.notify).not.toHaveBeenCalled();
  });
});

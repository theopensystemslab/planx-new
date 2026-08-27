import { logger } from "airbrake";
import React from "react";
import { setup } from "test/utils";
import { vi } from "vitest";

import { AppErrorBoundary } from "./AppErrorBoundary";
import { GraphError } from "./GraphError";

vi.mock("airbrake", () => ({
  logger: {
    notify: vi.fn(),
  },
}));

const ThrowError: React.FC = () => {
  throw new Error("Something broke");
};

const ThrowGraphError: React.FC = () => {
  throw new GraphError("nodeMustFollowFindProperty");
};

describe("AppErrorBoundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children when nothing throws", async () => {
    const { getByText } = await setup(
      <AppErrorBoundary>
        <h1>All good</h1>
      </AppErrorBoundary>,
    );

    expect(getByText("All good")).toBeInTheDocument();
    expect(logger.notify).not.toHaveBeenCalled();
  });

  it("renders ErrorFallback and reports to Airbrake with a component stack", async () => {
    const { getByText } = await setup(
      <AppErrorBoundary>
        <ThrowError />
      </AppErrorBoundary>,
    );

    expect(getByText(/Something went wrong/)).toBeInTheDocument();
    expect(logger.notify).toHaveBeenCalledTimes(1);
    expect(logger.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.any(Error),
        params: expect.objectContaining({
          componentStack: expect.any(String),
        }),
      }),
    );
  });

  it("skips reporting when disableReporting is set (but still renders the fallback)", async () => {
    const { getByText } = await setup(
      <AppErrorBoundary
        disableReporting
        FallbackComponent={() => <p>Soft failure</p>}
      >
        <ThrowError />
      </AppErrorBoundary>,
    );

    expect(getByText("Soft failure")).toBeInTheDocument();
    expect(logger.notify).not.toHaveBeenCalled();
  });

  it("displays a custom FallbackComponent", async () => {
    const { getByText } = await setup(
      <AppErrorBoundary FallbackComponent={() => <p>Custom fallback</p>}>
        <ThrowError />
      </AppErrorBoundary>,
    );

    expect(getByText("Custom fallback")).toBeInTheDocument();
  });

  it("does not report GraphErrors", async () => {
    const { getByRole } = await setup(
      <AppErrorBoundary>
        <ThrowGraphError />
      </AppErrorBoundary>,
    );

    expect(getByRole("heading", { name: /Invalid graph/ })).toBeInTheDocument();
    expect(logger.notify).not.toHaveBeenCalled();
  });
});

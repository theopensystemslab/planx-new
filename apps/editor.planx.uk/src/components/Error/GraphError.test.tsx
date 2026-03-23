import { logger } from "airbrake";
import ErrorFallback from "components/Error/ErrorFallback";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

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

it("does not render if a child does not throw an error", async () => {
  const { queryByRole } = await setup(
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <h1>No error</h1>
    </ErrorBoundary>,
  );
  expect(
    queryByRole("heading", { name: /Invalid graph/ }),
  ).not.toBeInTheDocument();
});

it("does not render if a child throws a non-Graph error", async () => {
  const { queryByRole, getByText } = await setup(
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ThrowError />
    </ErrorBoundary>,
  );
  // ErrorFallback displays...
  expect(getByText(/Something went wrong/)).toBeInTheDocument();
  // ...but does not show a GraphError
  expect(
    queryByRole("heading", { name: /Invalid graph/ }),
  ).not.toBeInTheDocument();
});

it("renders if a child throws an error", async () => {
  const { queryByText, getByRole } = await setup(
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ThrowGraphError />
    </ErrorBoundary>,
  );

  expect(queryByText(/Something went wrong/)).not.toBeInTheDocument();
  expect(getByRole("heading", { name: /Invalid graph/ })).toBeInTheDocument();
});

it("does not call Airbrake", async () => {
  const loggerSpy = vi.spyOn(logger, "notify");

  await setup(
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ThrowGraphError />
    </ErrorBoundary>,
  );

  expect(loggerSpy).not.toHaveBeenCalled();
});

it("should not have accessability violations", async () => {
  const { container } = await setup(
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ThrowGraphError />
    </ErrorBoundary>,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

import { setup } from "test/utils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

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

it("does not render if a child does not throw an error", async () => {
  const { queryByRole } = await setup(
    <AppErrorBoundary>
      <h1>No error</h1>
    </AppErrorBoundary>,
  );
  expect(
    queryByRole("heading", { name: /Invalid graph/ }),
  ).not.toBeInTheDocument();
});

it("does not render if a child throws a non-Graph error", async () => {
  const { queryByRole, getByText } = await setup(
    <AppErrorBoundary>
      <ThrowError />
    </AppErrorBoundary>,
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
    <AppErrorBoundary>
      <ThrowGraphError />
    </AppErrorBoundary>,
  );

  expect(queryByText(/Something went wrong/)).not.toBeInTheDocument();
  expect(getByRole("heading", { name: /Invalid graph/ })).toBeInTheDocument();
});

it("should not have accessability violations", async () => {
  const { container } = await setup(
    <AppErrorBoundary>
      <ThrowGraphError />
    </AppErrorBoundary>,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

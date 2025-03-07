import { MockedProvider } from "@apollo/client/testing";
import { screen } from "@testing-library/react";
import ErrorFallback from "components/Error/ErrorFallback";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { setup } from "testUtils";
import { vi } from "vitest";

import { presentationalPropsMock } from "./mocks/propsMock";
import PropertyInformation, {
  Presentational,
  PresentationalProps,
} from "./Public";

const defaultPresentationalProps: PresentationalProps = {
  ...presentationalPropsMock,
  overrideAnswer: vi.fn(),
};

test("renders a warning for editors if address data is not in state", async () => {
  setup(
    <MockedProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <PropertyInformation
          title="About the property"
          description="This is the information we currently have about the property"
        />
      </ErrorBoundary>
    </MockedProvider>,
  );

  expect(screen.getByTestId("error-summary-invalid-graph")).toBeInTheDocument();
});

test("renders correctly when property override is enabled", async () => {
  const handleSubmit = vi.fn();

  const { user } = setup(
    <MockedProvider>
      <Presentational
        {...defaultPresentationalProps}
        showPropertyTypeOverride={true}
        handleSubmit={handleSubmit}
      />
    </MockedProvider>,
  );

  expect(screen.getByText("About the property")).toBeInTheDocument();
  expect(screen.getByText("Property type")).toBeInTheDocument();

  await user.click(screen.getByTestId("continue-button"));
  expect(handleSubmit).toHaveBeenCalledTimes(1);
});

test("renders correctly when property override is toggled off", async () => {
  const handleSubmit = vi.fn();

  const { user } = setup(
    <MockedProvider>
      <Presentational
        {...defaultPresentationalProps}
        showPropertyTypeOverride={false}
        handleSubmit={handleSubmit}
      />
    </MockedProvider>,
  );

  expect(screen.getByText("About the property")).toBeInTheDocument();
  expect(screen.getByText("Property type")).toBeInTheDocument();

  expect(screen.queryByText("Change")).not.toBeInTheDocument();

  await user.click(screen.getByTestId("continue-button"));
  expect(handleSubmit).toHaveBeenCalledTimes(1);
});

import ErrorFallback from "components/Error/ErrorFallback";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import classifiedRoadsResponseMock from "./mocks/classifiedRoadsResponseMock";
import digitalLandResponseMock from "./mocks/digitalLandResponseMock";
import PlanningConstraints from "./Public";

vi.mock("swr", () => ({
  default: vi.fn((url: () => string) => {
    const isGISRequest = url()?.startsWith(
      `${import.meta.env.VITE_APP_API_URL}/gis/`,
    );
    const isRoadsRequest = url()?.startsWith(
      `${import.meta.env.VITE_APP_API_URL}/roads/`,
    );

    if (isGISRequest) return { data: digitalLandResponseMock };
    if (isRoadsRequest) return { data: classifiedRoadsResponseMock };

    return { data: null };
  }),
}));

describe("error state", () => {
  it("renders an error if no addres is present in the passport", async () => {
    const handleSubmit = vi.fn();

    const { getByRole, getByTestId } = setup(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <PlanningConstraints
          title="Planning constraints"
          description="Things that might affect your project"
          fn="property.constraints.planning"
          disclaimer="This page does not include information about historic planning conditions that may apply to this property."
          handleSubmit={handleSubmit}
        />
        ,
      </ErrorBoundary>,
    );

    expect(getByTestId("error-summary-invalid-graph")).toBeInTheDocument();
    expect(getByRole("heading", { name: "Invalid graph" })).toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = setup(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <PlanningConstraints
          title="Planning constraints"
          description="Things that might affect your project"
          fn="property.constraints.planning"
          disclaimer="This page does not include information about historic planning conditions that may apply to this property."
        />
        ,
      </ErrorBoundary>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

it.todo("renders correctly");

it.todo("should not have any accessibility violations");

it.todo("fetches classified roads only when we have a siteBoundary"); // using expect(spy).toHaveBeenCalled() ??

it.todo("fetches planning constraints when we have lng,lat or siteBoundary");

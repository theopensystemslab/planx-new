import { screen } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import classifiedRoadsResponseMock from "./mocks/classifiedRoadsResponseMock";
import digitalLandResponseMock from "./mocks/digitalLandResponseMock";
import PlanningConstraints from "./Public";

vi.mock("swr", () => ({
  default: vi.fn((url: any) => {
    const isGISRequest = url()?.startsWith(
      `${import.meta.env.VITE_APP_API_URL}/gis/`,
    );
    const isRoadsRequest = url()?.startsWith(
      `${import.meta.env.VITE_APP_API_URL}/roads/`,
    );

    if (isGISRequest) return { data: digitalLandResponseMock } as any;
    if (isRoadsRequest) return { data: classifiedRoadsResponseMock } as any;

    return { data: null };
  }),
}));

it("renders correctly", async () => {
  const handleSubmit = vi.fn();

  const { user } = setup(
    <PlanningConstraints
      title="Planning constraints"
      description="Things that might affect your project"
      fn="property.constraints.planning"
      disclaimer="This page does not include information about historic planning conditions that may apply to this property."
      handleSubmit={handleSubmit}
    />,
  );

  expect(screen.getByText("Planning constraints")).toBeInTheDocument();

  // TODO mock passport _address so that SWR request is actually triggered to return mock response
  expect(screen.getByTestId("error-summary-invalid-graph")).toBeInTheDocument();

  await user.click(screen.getByTestId("continue-button"));
  expect(handleSubmit).toHaveBeenCalledTimes(1);
});

it("should not have any accessibility violations", async () => {
  const { container } = setup(
    <PlanningConstraints
      title="Planning constraints"
      description="Things that might affect your project"
      fn="property.constraints.planning"
      disclaimer="This page does not include information about historic planning conditions that may apply to this property."
    />,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

it.todo("fetches classified roads only when we have a siteBoundary"); // using expect(spy).toHaveBeenCalled() ??

it.todo("fetches planning constraints when we have lng,lat or siteBoundary");

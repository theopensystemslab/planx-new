import { MockedProvider } from "@apollo/client/testing";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-helper";
import React from "react";
import * as ReactNavi from "react-navi";
import * as SWR from "swr";

import digitalLandResponseMock from "./mocks/digitalLandResponseMock";
import teamMock from "./mocks/teamMock";
import PlanningConstraints from "./Public";

const TEAM = "opensystemslab";

jest.spyOn(SWR, "default").mockImplementation((url: any) => {
  return {
    data: url()?.startsWith(`${process.env.REACT_APP_API_URL}/gis/`)
      ? digitalLandResponseMock
      : null,
  } as any;
});

jest.spyOn(ReactNavi, "useCurrentRoute").mockImplementation(
  () =>
    ({
      data: {
        team: TEAM,
      },
    } as any)
);

it("renders correctly", async () => {
  const handleSubmit = jest.fn();

  render(
    <MockedProvider mocks={teamMock} addTypename={false}>
      <PlanningConstraints
        title="Planning constraints"
        description="Things that might affect your project"
        fn="property.constraints.planning"
        handleSubmit={handleSubmit}
      />
    </MockedProvider>
  );

  // TODO mock passport _address so that SWR request is actually triggered to return mock response

  expect(screen.getByText("Planning constraints")).toBeInTheDocument;

  await act(async () => {
    userEvent.click(screen.getByTestId("continue-button"));
  });
  expect(handleSubmit).toHaveBeenCalledTimes(1);
});

it("should not have any accessibility violations", async () => {
  const { container } = render(
    <MockedProvider mocks={teamMock} addTypename={false}>
      <PlanningConstraints
        title="Planning constraints"
        description="Things that might affect your project"
        fn="property.constraints.planning"
      />
    </MockedProvider>
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

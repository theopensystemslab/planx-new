import { MockedProvider } from "@apollo/client/testing";
import { screen } from "@testing-library/react";
import React from "react";
import * as ReactNavi from "react-navi";
import * as SWR from "swr";
import { axe, setup } from "testUtils";

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

  const { user } = setup(
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

  expect(screen.getByText("Planning constraints")).toBeInTheDocument();
  await user.click(screen.getByTestId("continue-button"));
  expect(handleSubmit).toHaveBeenCalledTimes(1);
});

it("should not have any accessibility violations", async () => {
  const { container } = setup(
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

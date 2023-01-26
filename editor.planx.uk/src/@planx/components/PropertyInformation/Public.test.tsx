import { MockedProvider } from "@apollo/client/testing";
import { screen } from "@testing-library/react";
import React from "react";
import * as ReactNavi from "react-navi";
import * as SWR from "swr";
import { setup } from "testUtils";

import localAuthorityMock from "./mocks/localAuthorityMock";
import teamMock from "./mocks/teamMock";
import PropertyInformation from "./Public";

const TEAM = "southwark";

jest.spyOn(SWR, "default").mockImplementation((url: any) => {
  return {
    data: url()?.startsWith("https://www.planning.data.gov.uk")
      ? localAuthorityMock
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

test("renders a warning for editors if address data is not in state", async () => {
  const handleSubmit = jest.fn();

  const { user } = setup(
    <MockedProvider mocks={teamMock} addTypename={false}>
      <PropertyInformation
        title="About the property"
        description="This is the information we currently have about the property"
        handleSubmit={handleSubmit}
      />
    </MockedProvider>
  );

  expect(screen.getByTestId("error-summary-invalid-graph")).toBeInTheDocument();
});

test.skip("renders correctly", async () => {
  const handleSubmit = jest.fn();

  const useStore = jest.fn();
  useStore.mockReturnValue([
    {
      uprn: "200003453480",
      blpu_code: "2",
      latitude: 51.4859056,
      longitude: -0.0760466,
      organisation: null,
      pao: "47",
      street: "COBOURG ROAD",
      town: "LONDON",
      postcode: "SE5 0HU",
      x: 533683,
      y: 178083,
      planx_description: "HMO Parent",
      planx_value: "residential.HMO.parent",
      single_line_address: "47, COBOURG ROAD, LONDON, SOUTHWARK, SE5 0HU",
      title: "47, COBOURG ROAD, LONDON",
    },
    ["residential.HMO.parent"],
  ]);

  const { user } = setup(
    <MockedProvider mocks={teamMock} addTypename={false}>
      <PropertyInformation
        title="About the property"
        description="This is the information we currently have about the property"
        handleSubmit={handleSubmit}
      />
    </MockedProvider>
  );

  expect(screen.getByText("About the property")).toBeInTheDocument();
  await user.click(screen.getByTestId("continue-button"));
  expect(handleSubmit).toHaveBeenCalledTimes(1);
});

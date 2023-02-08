import { MockedProvider } from "@apollo/client/testing";
import { screen } from "@testing-library/react";
import React from "react";
import * as ReactNavi from "react-navi";
import { setup } from "testUtils";

import teamMock from "./mocks/teamMock";
import PropertyInformation, { Presentational } from "./Public";

const TEAM = "southwark";

jest.spyOn(ReactNavi, "useCurrentRoute").mockImplementation(
  () =>
    ({
      data: {
        team: TEAM,
      },
    } as any)
);

const defaultPresentationalProps = {
  title: "About the property",
  description: "This is the information we currently have about the property",
  address: {
    uprn: "200003497830",
    town: "LONDON",
    y: 177898.62376470293,
    x: 533662.1449918789,
    street: "COBOURG ROAD",
    sao: "",
    postcode: "SE5 0HU",
    pao: "103",
    organisation: "",
    blpu_code: "PP",
    latitude: 51.4842536,
    longitude: -0.0764165,
    single_line_address: "103 COBOURG ROAD, LONDON, SE5 0HU",
    title: "103 COBOURG ROAD, LONDON",
    planx_description: "HMO Parent",
    planx_value: "residential.HMO.parent",
  },
  propertyType: ["residential.HMO.parent"],
  localAuthorityDistrict: ["Southwark"],
};

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

test("renders correctly", async () => {
  const handleSubmit = jest.fn();
  const overrideAnswer = jest.fn();

  const { user } = setup(
    <MockedProvider mocks={teamMock} addTypename={false}>
      <Presentational
        {...defaultPresentationalProps}
        showPropertyTypeOverride={true}
        overrideAnswer={overrideAnswer}
        handleSubmit={handleSubmit}
      />
    </MockedProvider>
  );

  expect(screen.getByText("About the property")).toBeInTheDocument();
  expect(screen.getByText("Property type")).toBeInTheDocument();
  expect(screen.getByText("Change")).toBeInTheDocument();

  await user.click(screen.getByTestId("continue-button"));
  expect(handleSubmit).toHaveBeenCalledTimes(1);
});

test("hides 'change' link if the editor has not selected the override option", async () => {
  const handleSubmit = jest.fn();
  const overrideAnswer = jest.fn();

  const { user } = setup(
    <MockedProvider mocks={teamMock} addTypename={false}>
      <Presentational
        {...defaultPresentationalProps}
        showPropertyTypeOverride={false}
        overrideAnswer={overrideAnswer}
        handleSubmit={handleSubmit}
      />
    </MockedProvider>
  );

  expect(screen.getByText("About the property")).toBeInTheDocument();
  expect(screen.getByText("Property type")).toBeInTheDocument();
  expect(screen.queryByText("Change")).not.toBeInTheDocument();

  await user.click(screen.getByTestId("continue-button"));
  expect(handleSubmit).toHaveBeenCalledTimes(1);
});

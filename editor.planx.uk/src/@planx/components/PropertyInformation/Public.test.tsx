import { MockedProvider } from "@apollo/client/testing";
import { screen } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";

import PropertyInformation, {
  Presentational,
  PresentationalProps,
} from "./Public";

const defaultPresentationalProps: PresentationalProps = {
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
    source: "os",
  },
  propertyType: ["residential.HMO.parent"],
  localAuthorityDistrict: ["Southwark"],
  overrideAnswer: jest.fn(),
};

test("renders a warning for editors if address data is not in state", async () => {
  setup(
    <MockedProvider>
      <PropertyInformation
        title="About the property"
        description="This is the information we currently have about the property"
      />
    </MockedProvider>
  );

  expect(screen.getByTestId("error-summary-invalid-graph")).toBeInTheDocument();
});

test("renders correctly when property override is enabled", async () => {
  const handleSubmit = jest.fn();

  const { user } = setup(
    <MockedProvider>
      <Presentational
        {...defaultPresentationalProps}
        showPropertyTypeOverride={true}
        handleSubmit={handleSubmit}
      />
    </MockedProvider>
  );

  expect(screen.getByText("About the property")).toBeInTheDocument();
  expect(screen.getByText("Property type")).toBeInTheDocument();

  expect(screen.getByText("Change")).toBeInTheDocument();
  expect(screen.queryByText("Report an inaccuracy")).not.toBeInTheDocument();

  await user.click(screen.getByTestId("continue-button"));
  expect(handleSubmit).toHaveBeenCalledTimes(1);
});

test("renders correctly when property override is toggled off", async () => {
  const handleSubmit = jest.fn();

  const { user } = setup(
    <MockedProvider>
      <Presentational
        {...defaultPresentationalProps}
        showPropertyTypeOverride={false}
        handleSubmit={handleSubmit}
      />
    </MockedProvider>
  );

  expect(screen.getByText("About the property")).toBeInTheDocument();
  expect(screen.getByText("Property type")).toBeInTheDocument();

  expect(screen.queryByText("Change")).not.toBeInTheDocument();
  expect(screen.getByText("Report an inaccuracy")).toBeInTheDocument();

  await user.click(screen.getByTestId("continue-button"));
  expect(handleSubmit).toHaveBeenCalledTimes(1);
});

test("retains previously submitted feedback when going back", async () => {
  const { user } = setup(
    <MockedProvider>
      <Presentational
        {...defaultPresentationalProps}
        showPropertyTypeOverride={false}
        previousFeedback="My property type is wrong"
      />
    </MockedProvider>
  );

  expect(screen.getByText("Report an inaccuracy")).toBeInTheDocument();

  // expand the feedback input
  await user.click(screen.getByText("Report an inaccuracy"));
  expect(screen.getByText("My property type is wrong")).toBeInTheDocument();
});

import { MockedProvider } from "@apollo/client/testing";
import { screen } from "@testing-library/react";
import React from "react";
import * as ReactNavi from "react-navi";
import * as SWR from "swr";
import { axe, setup } from "testUtils";

import FindProperty from "./";
import findAddressReturnMock from "./mocks/findAddressReturnMock";
import localAuthorityMock from "./mocks/localAuthorityMock";

const TEAM = "canterbury";

jest.spyOn(ReactNavi, "useCurrentRoute").mockImplementation(
  () =>
    ({
      data: {
        team: TEAM,
      },
    } as any)
);

jest.spyOn(SWR, "default").mockImplementation((url: any) => {
  return {
    data: url()?.startsWith("https://www.planning.data.gov.uk")
      ? localAuthorityMock
      : null,
  } as any;
});

test("renders correctly", async () => {
  const handleSubmit = jest.fn();

  const { user } = setup(
    <MockedProvider mocks={findAddressReturnMock} addTypename={false}>
      <FindProperty
        description="Find your property"
        title="Type your postal code"
        allowNewAddresses={false}
        handleSubmit={handleSubmit}
      />
    </MockedProvider>
  );

  // autocomplete does not exist in the DOM on initial render
  expect(screen.queryByTestId("address-autocomplete-web-component")).toBeNull();

  // type a valid postcode
  await user.type(await screen.findByLabelText("Postcode"), "SE5 0HU");

  // expect the autocomplete to be rendered with the correct postcode prop & empty initial address
  const autocomplete = screen.getByTestId("address-autocomplete-web-component");
  expect(autocomplete).toBeInTheDocument();
  expect(autocomplete.getAttribute("postcode")).toEqual("SE5 0HU");
  expect(autocomplete.getAttribute("initialAddress")).toBeFalsy();

  // expect continue to be disabled because an address has not been selected
  expect(screen.getByTestId("continue-button")).toBeDisabled();
  expect(handleSubmit).not.toHaveBeenCalled();
});

test("it displays an error if you submit an invalid postcode", async () => {
  const handleSubmit = jest.fn();

  const { user } = setup(
    <MockedProvider mocks={findAddressReturnMock} addTypename={false}>
      <FindProperty
        description="Find your property"
        title="Type your postal code"
        allowNewAddresses={false}
        handleSubmit={handleSubmit}
      />
    </MockedProvider>
  );

  await user.type(await screen.findByLabelText("Postcode"), "SE5{enter}");

  expect(screen.getByText("Enter a valid UK postcode")).toBeInTheDocument();
});

test("recovers previously submitted address when clicking the back button", async () => {
  const handleSubmit = jest.fn();
  const previousData = {
    _address: {
      __typename: "addresses",
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
      latitude: "51.4842536",
      longitude: "-0.0764165",
      single_line_address: "103 COBOURG ROAD, LONDON, SE5 0HU",
      title: "103 COBOURG ROAD, LONDON",
      planx_description: "HMO Parent",
      planx_value: "residential.HMO.parent",
      administrative_area: "SOUTHWARK",
      local_custodian_code: "SOUTHWARK",
    },
    "property.type": ["residential.HMO.parent"],
    "property.localAuthorityDistrict": ["Southwark"],
    "property.region": ["London"],
  };

  const { user } = setup(
    <MockedProvider mocks={findAddressReturnMock} addTypename={false}>
      <FindProperty
        description="Find your property"
        title="Type your postal code"
        allowNewAddresses={false}
        handleSubmit={handleSubmit}
        previouslySubmittedData={{
          data: previousData,
        }}
      />
    </MockedProvider>
  );

  await user.click(await screen.findByTestId("continue-button"));

  await user.click(await screen.findByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalledWith({
    data: previousData,
  });
});

it("should not have any accessibility violations", async () => {
  const handleSubmit = jest.fn();
  const { container, user } = setup(
    <MockedProvider mocks={findAddressReturnMock} addTypename={false}>
      <FindProperty
        description="Find your property"
        title="Type your postal code"
        allowNewAddresses={false}
        handleSubmit={handleSubmit}
      />
    </MockedProvider>
  );

  await user.type(await screen.findByLabelText("Postcode"), "SE5 0HU");
  // shadow DOM is not rendered, so autocomplete does not actually "open" on typing or account for dropdown options here

  await user.type(
    await screen.findByTestId("address-autocomplete-web-component"),
    "75"
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

it("updates the address-autocomplete props when the postcode is changed", async () => {
  // Arrange
  const { user } = setup(
    <MockedProvider mocks={findAddressReturnMock} addTypename={false}>
      <FindProperty
        description="Find your property"
        title="Type your postal code"
        allowNewAddresses={false}
      />
    </MockedProvider>
  );

  // Enter a postcode...
  await user.type(await screen.findByLabelText("Postcode"), "SE5 0HU");

  // Expect autocomplete to be rendered with the correct postcode prop
  expect(
    screen.getByTestId("address-autocomplete-web-component")
  ).toBeInTheDocument();
  expect(
    screen
      .getByTestId("address-autocomplete-web-component")
      .getAttribute("postcode")
  ).toEqual("SE5 0HU");

  // Now go back and change the postcode
  await user.clear(screen.getByLabelText("Postcode"));
  await user.type(screen.getByLabelText("Postcode"), "SE5 0HX");

  // Expect autocomplete to be rendered with the new postcode prop
  expect(
    screen
      .getByTestId("address-autocomplete-web-component")
      .getAttribute("postcode")
  ).toEqual("SE5 0HX");

  // User is unable to continue and to submit incomplete data
  const continueButton = screen.getByTestId("continue-button");
  expect(continueButton).toBeDisabled();
});

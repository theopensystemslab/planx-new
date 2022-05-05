import { MockedProvider } from "@apollo/client/testing";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-helper";
import React from "react";
import * as ReactNavi from "react-navi";
import * as SWR from "swr";

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
    data: url()?.startsWith("https://www.digital-land")
      ? localAuthorityMock
      : null,
  } as any;
});

test("renders correctly", async () => {
  const handleSubmit = jest.fn();

  render(
    <MockedProvider mocks={findAddressReturnMock} addTypename={false}>
      <FindProperty
        description="Find your property"
        title="Type your postal code"
        handleSubmit={handleSubmit}
      />
    </MockedProvider>
  );

  // autocomplete does not exist in the DOM on initial render
  expect(screen.queryByTestId("address-autocomplete-web-component")).toBeNull();

  // type a valid postcode
  await waitFor(async () => {
    userEvent.type(screen.getByLabelText("Postcode"), "SE5 0HU");
  });

  // expect the autocomplete to be rendered with the correct postcode prop & empty initial address
  const autocomplete = screen.getByTestId("address-autocomplete-web-component");
  expect(autocomplete).toBeInTheDocument;
  expect(autocomplete.getAttribute("postcode")).toEqual("SE5 0HU");
  expect(autocomplete.getAttribute("intialAddress")).toBeFalsy();

  // expect continue to be disabled because an address has not been selected
  expect(screen.getByTestId("continue-button")).toBeDisabled;
  expect(handleSubmit).not.toHaveBeenCalled();
});

test("it displays an error if you submit an invalid postcode", async () => {
  const handleSubmit = jest.fn();

  render(
    <MockedProvider mocks={findAddressReturnMock} addTypename={false}>
      <FindProperty
        description="Find your property"
        title="Type your postal code"
        handleSubmit={handleSubmit}
      />
    </MockedProvider>
  );

  await waitFor(async () => {
    userEvent.type(screen.getByLabelText("Postcode"), "SE5{enter}");
  });

  expect(screen.getByText("Enter a valid UK postcode")).toBeInTheDocument;
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
  };

  render(
    <MockedProvider mocks={findAddressReturnMock} addTypename={false}>
      <FindProperty
        description="Find your property"
        title="Type your postal code"
        handleSubmit={handleSubmit}
        previouslySubmittedData={{
          data: previousData,
        }}
      />
    </MockedProvider>
  );

  await waitFor(async () => {
    userEvent.click(screen.getByTestId("continue-button"));
  });
  await waitFor(async () => {
    userEvent.click(screen.getByTestId("continue-button"));
  });

  expect(handleSubmit).toHaveBeenCalledWith({
    data: previousData,
  });
});

it("should not have any accessibility violations", async () => {
  const handleSubmit = jest.fn();
  const { container } = render(
    <MockedProvider mocks={findAddressReturnMock} addTypename={false}>
      <FindProperty
        description="Find your property"
        title="Type your postal code"
        handleSubmit={handleSubmit}
      />
    </MockedProvider>
  );

  await waitFor(async () => {
    await userEvent.type(screen.getByLabelText("Postcode"), "SE5 0HU");
  });
  // shadow DOM is not rendered, so autocomplete does not actually "open" on typing or account for dropdown options here
  await waitFor(async () => {
    await userEvent.type(
      screen.getByTestId("address-autocomplete-web-component"),
      "75"
    );
  });
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

it("updates the address-autocomplete props when the postcode is changed", async () => {
  // Arrange
  render(
    <MockedProvider mocks={findAddressReturnMock} addTypename={false}>
      <FindProperty
        description="Find your property"
        title="Type your postal code"
      />
    </MockedProvider>
  );

  // Enter a postcode...
  await waitFor(async () => {
    userEvent.type(screen.getByLabelText("Postcode"), "SE5 0HU");
  });

  // Expect autocomplete to be rendered with the correct postcode prop
  expect(screen.getByTestId("address-autocomplete-web-component"))
    .toBeInTheDocument;
  expect(
    screen
      .getByTestId("address-autocomplete-web-component")
      .getAttribute("postcode")
  ).toEqual("SE5 0HU");

  // Now go back and change the postcode
  await waitFor(async () => {
    await userEvent.clear(screen.getByLabelText("Postcode"));
    await userEvent.type(screen.getByLabelText("Postcode"), "SE5 0HX");
  });

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

import { MockedProvider } from "@apollo/client/testing";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-helper";
import React from "react";
import * as ReactNavi from "react-navi";
import * as SWR from "swr";

import FindProperty from "./";
import findAddressReturnMock from "./mocks/findAddressReturnMock";
import postcodeMock from "./mocks/postcodeMock";

const TEAM = "canterbury";

jest.spyOn(SWR, "default").mockImplementation((url: any) => {
  return {
    data: postcodeMock,
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

  await waitFor(async () => {
    await userEvent.type(screen.getByLabelText("Postcode"), "SE5 0HU");
  });
  await waitFor(async () => {
    await userEvent.type(screen.getByTestId("autocomplete-input"), "75");
  });
  await act(async () => {
    userEvent.click(screen.getByText("75, COBOURG ROAD, LONDON"));
  });
  await act(async () => {
    userEvent.click(screen.getByText("Continue"));
  });
  await act(async () => {
    userEvent.click(screen.getByText("Continue"));
  });

  expect(handleSubmit).toHaveBeenCalled();
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
    },
    "property.type": ["residential.HMO.parent"],
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
    userEvent.click(screen.getByText("Continue"));
  });
  await waitFor(async () => {
    userEvent.click(screen.getByText("Continue"));
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

  // Ensure we also test the address drop down
  // Note: MUI v4 has an a11y issue here when the dropdown is open, is has to be closed before we can test
  // This has been resolved in v5
  // https://github.com/mui-org/material-ui/issues/22302
  await waitFor(async () => {
    await userEvent.type(screen.getByLabelText("Postcode"), "SE5 0HU");
  });
  await waitFor(async () => {
    await userEvent.type(screen.getByTestId("autocomplete-input"), "75");
  });
  await act(async () => {
    userEvent.click(screen.getByText("75, COBOURG ROAD, LONDON"));
  });
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

it("clears the old address when the postcode is typed in", async () => {
  // Arrange
  render(
    <MockedProvider mocks={findAddressReturnMock} addTypename={false}>
      <FindProperty
        description="Find your property"
        title="Type your postal code"
      />
    </MockedProvider>
  );

  // Act
  // Enter a postcode...
  await waitFor(async () => {
    userEvent.type(screen.getByLabelText("Postcode"), "S15 4ST");
  });
  // ...and select an address
  await waitFor(async () => {
    userEvent.type(screen.getByTestId("autocomplete-input"), "75");
  });
  await act(async () => {
    userEvent.click(screen.getByText("75, COBOURG ROAD, LONDON"));
  });

  // Now go back and change the postcode
  await waitFor(async () => {
    await userEvent.clear(screen.getByLabelText("Postcode"));
    await userEvent.type(screen.getByLabelText("Postcode"), "SE5 0HX");
  });

  // Assert
  const [postcodeInput, addressInput] = screen.getAllByRole("textbox");

  // New postcode and blank address field should display
  expect(postcodeInput).toHaveValue("SE5 0HX");
  expect(addressInput).not.toBeUndefined();
  expect(addressInput).toHaveValue(undefined);

  // User is unable to continue and to submit incomplete data
  const continueButton = screen.getByText("Continue").parentElement;
  expect(continueButton).toBeDisabled();
});

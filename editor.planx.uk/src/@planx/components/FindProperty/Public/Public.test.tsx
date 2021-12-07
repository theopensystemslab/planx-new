import { MockedProvider } from "@apollo/client/testing";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

const originalFetch = global.fetch;
global.fetch = jest.fn(async () => ({
  json: async () => ({ rates: { CAD: 1.42 } }),
})) as any;

afterAll(() => {
  jest.restoreAllMocks();
  global.fetch = originalFetch;
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

  await waitFor(async () => {
    await userEvent.type(
      screen.getByPlaceholderText("Enter the postcode of the property"),
      "SE5 0HU",
      {
        delay: 1,
      }
    );
  });
  await waitFor(async () => {
    await userEvent.type(screen.getByTestId("autocomplete-input"), "75", {
      delay: 1,
    });
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

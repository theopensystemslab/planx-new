import { MockedProvider } from "@apollo/client/testing";
import { screen } from "@testing-library/react";
import React from "react";
import * as SWR from "swr";
import { axe, setup } from "testUtils";

import FindProperty from "./";
import findAddressReturnMock from "./mocks/findAddressReturnMock";
import localAuthorityMock from "./mocks/localAuthorityMock";

const osAddressProps = {
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
    source: "os",
  },
  "property.type": ["residential.HMO.parent"],
  "property.localAuthorityDistrict": ["Southwark"],
  "property.region": ["London"],
};

const proposedAddressProps = {
  _address: {
    y: 177898.62376470293,
    x: 533662.1449918789,
    latitude: "51.4842536",
    longitude: "-0.0764165",
    title: "Land at test and testing",
    source: "proposed",
  },
  "property.localAuthorityDistrict": ["Southwark"],
  "property.region": ["London"],
};

jest.spyOn(SWR, "default").mockImplementation((url: any) => {
  return {
    data: url()?.startsWith("https://www.planning.data.gov.uk")
      ? localAuthorityMock
      : null,
  } as any;
});

describe("render states", () => {
  it("renders correctly and defaults to the address autocomplete page", async () => {
    const handleSubmit = jest.fn();

    const { user } = setup(
      <MockedProvider mocks={findAddressReturnMock} addTypename={false}>
        <FindProperty
          description="Find your property"
          title="Type your postal code"
          handleSubmit={handleSubmit}
        />
      </MockedProvider>
    );

    // autocomplete does not exist in the DOM on initial render
    expect(
      screen.queryByTestId("address-autocomplete-web-component")
    ).toBeNull();

    // type a valid postcode
    await user.type(await screen.findByLabelText("Postcode"), "SE5 0HU");

    // expect the autocomplete to be rendered with the correct postcode prop & empty initial address
    const autocomplete = screen.getByTestId(
      "address-autocomplete-web-component"
    );
    expect(autocomplete).toBeInTheDocument();
    expect(autocomplete.getAttribute("postcode")).toEqual("SE5 0HU");
    expect(autocomplete.getAttribute("initialAddress")).toBeFalsy();

    // expect continue to be disabled because an address has not been selected
    expect(screen.getByTestId("continue-button")).toBeDisabled();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("renders correctly when allowing non-UPRN addresses", async () => {
    const handleSubmit = jest.fn();

    const { user } = setup(
      <MockedProvider mocks={findAddressReturnMock} addTypename={false}>
        <FindProperty
          description="Find your property"
          title="Type your postal code"
          allowNewAddresses={true}
          newAddressTitle="Plot a new address"
          handleSubmit={handleSubmit}
        />
      </MockedProvider>
    );

    // starts on address-autocomplete page
    expect(
      await screen.findByText("Type your postal code")
    ).toBeInTheDocument();

    // click the link to switch pages
    await user.click(
      await screen.findByText("The site does not have an address")
    );

    // confirm we've switched pages
    expect(await screen.findByText("Plot a new address")).toBeInTheDocument();

    const map = screen.getByTestId("map-web-component");
    expect(map).toBeInTheDocument();

    const descriptionInput = screen.getByTestId("new-address-input");
    expect(descriptionInput).toBeInTheDocument();

    // expect continue to be disabled because an address has not been selected
    expect(screen.getByTestId("continue-button")).toBeDisabled();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("opens the external planning site dialog by default if allowNewAddresses is toggled off", async () => {
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

    await user.click(
      await screen.findByText("The site does not have an address")
    );

    // confirm we can open & close the dialog
    expect(
      screen.getByTestId("external-planning-site-dialog")
    ).toBeInTheDocument();
    await user.click(await screen.findByText("Return to application"));

    // land back on the autocomplete page
    expect(
      await screen.findByText("Type your postal code")
    ).toBeInTheDocument();

    expect(screen.getByTestId("continue-button")).toBeDisabled();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("clears address data when switching between pages", async () => {
    const handleSubmit = jest.fn();
    const previousData = osAddressProps;

    const { user } = setup(
      <MockedProvider mocks={findAddressReturnMock} addTypename={false}>
        <FindProperty
          description="Find your property"
          title="Type your postal code"
          allowNewAddresses
          handleSubmit={handleSubmit}
          previouslySubmittedData={{
            data: previousData,
          }}
        />
      </MockedProvider>
    );

    // confirm that we've landed on the autocomplete page because our address source is "os"
    expect(await screen.findByText("Find your property")).toBeInTheDocument();

    // switch pages
    await user.click(
      await screen.findByText("The site does not have an address")
    );

    // confirm that site description & coordinates are empty
    const siteDescriptionInput = screen.getByLabelText(
      "Name the site"
    ) as HTMLInputElement;
    expect(siteDescriptionInput).toHaveValue("");

    // expect(screen.getByText("0 Easting")).toBeInTheDocument();
    // expect(screen.getByText("0 Northing")).toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const handleSubmit = jest.fn();
    const { container, user } = setup(
      <MockedProvider mocks={findAddressReturnMock} addTypename={false}>
        <FindProperty
          description="Find your property"
          title="Type your postal code"
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
});

describe("picking an OS address", () => {
  it("displays an error if you submit an invalid postcode", async () => {
    const handleSubmit = jest.fn();

    const { user } = setup(
      <MockedProvider mocks={findAddressReturnMock} addTypename={false}>
        <FindProperty
          description="Find your property"
          title="Type your postal code"
          handleSubmit={handleSubmit}
        />
      </MockedProvider>
    );

    await user.type(await screen.findByLabelText("Postcode"), "SE5{enter}");
    expect(screen.getByText("Enter a valid UK postcode")).toBeInTheDocument();
  });

  it("updates the address-autocomplete props when the postcode is changed", async () => {
    const { user } = setup(
      <MockedProvider mocks={findAddressReturnMock} addTypename={false}>
        <FindProperty
          description="Find your property"
          title="Type your postal code"
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

  it("recovers previously submitted address when clicking the back button", async () => {
    const handleSubmit = jest.fn();
    const previousData = osAddressProps;

    const { user } = setup(
      <MockedProvider mocks={findAddressReturnMock} addTypename={false}>
        <FindProperty
          description="Find your property"
          title="Type your postal code"
          allowNewAddresses
          handleSubmit={handleSubmit}
          previouslySubmittedData={{
            data: previousData,
          }}
        />
      </MockedProvider>
    );

    // confirm that we've immediately landed on the autocomplete page because our address source is "os"
    expect(await screen.findByText("Find your property")).toBeInTheDocument();

    await user.click(await screen.findByTestId("continue-button"));
    expect(handleSubmit).toHaveBeenCalledWith({
      data: previousData,
    });
  });
});

describe("plotting a new address that does not have a uprn yet", () => {
  it("displays an error if you haven't entered a site address", async () => {
    const handleSubmit = jest.fn();

    const { user } = setup(
      <MockedProvider mocks={findAddressReturnMock} addTypename={false}>
        <FindProperty
          description="Find your property"
          title="Type your postal code"
          allowNewAddresses={true}
          newAddressTitle="Plot a new address"
          handleSubmit={handleSubmit}
        />
      </MockedProvider>
    );

    // starts on address-autocomplete page
    expect(
      await screen.findByText("Type your postal code")
    ).toBeInTheDocument();

    // click the link to switch pages
    await user.click(
      await screen.findByText("The site does not have an address")
    );

    // confirm we've switched pages
    expect(screen.getByTestId("new-address-input")).toBeInTheDocument();

    // keyUp should trigger the error message to display
    await user.type(await screen.findByLabelText("Name the site"), "{enter}");
    expect(
      screen.getByText(`Enter a site description such as "Land at..."`)
    ).toBeInTheDocument();

    // expect continue to be disabled because we have incomplete address details
    expect(screen.getByTestId("continue-button")).toBeDisabled();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("recovers previously submitted address when clicking the back button and lands on the map page", async () => {
    const handleSubmit = jest.fn();
    const previousData = proposedAddressProps;

    const { user } = setup(
      <MockedProvider mocks={findAddressReturnMock} addTypename={false}>
        <FindProperty
          description="Find your property"
          title="Type your postal code"
          allowNewAddresses
          newAddressTitle="Plot a new address"
          handleSubmit={handleSubmit}
          previouslySubmittedData={{
            data: previousData,
          }}
        />
      </MockedProvider>
    );

    // confirm that we've immediately landed on the map page because our address source is "proposed"
    expect(await screen.findByText("Plot a new address")).toBeInTheDocument();

    await user.click(await screen.findByTestId("continue-button"));
    expect(handleSubmit).toHaveBeenCalledWith({
      data: previousData,
    });
  });
});

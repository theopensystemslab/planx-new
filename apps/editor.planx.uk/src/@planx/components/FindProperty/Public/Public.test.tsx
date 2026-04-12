import { screen } from "@testing-library/react";
import {
  graphql,
  type GraphQLHandler,
  http,
  type HttpHandler,
  HttpResponse,
} from "msw";
import React from "react";
import server from "test/mockServer";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import FindProperty from ".";
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
    ward: "E05011109",
    source: "os",
  },
  "property.type": ["residential.HMO.parent"],
  "property.localAuthorityDistrict": ["Southwark"],
  "property.localPlanningAuthority": ["Southwark LPA"],
  "property.region": ["London"],
  "property.ward": ["Old Kent Road"],
  "property.boundary.area": 1232.22,
  "property.boundary.area.hectares": 0.123222,
  "property.boundary": {
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [-0.076691, 51.484197],
            [-0.075933, 51.484124],
            [-0.075856, 51.484369],
            [-0.075889, 51.484372],
            [-0.0759, 51.484324],
            [-0.076391, 51.484369],
            [-0.076388, 51.484383],
            [-0.076644, 51.484409],
            [-0.076691, 51.484197],
          ],
        ],
      ],
    },
    type: "Feature",
    properties: {
      "entry-date": "2023-12-12",
      "start-date": "2011-08-25",
      "end-date": "",
      entity: 12000601059,
      name: "",
      dataset: "title-boundary",
      typology: "geography",
      reference: "52725257",
      prefix: "title-boundary",
      "organisation-entity": "13",
    },
  },
  "findProperty.action": "Selected an existing address",
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
  "property.localPlanningAuthority": ["Southwark LPA"],
  "property.region": ["London"],
  "property.type": ["unclassified"],
  "property.ward": ["Old Kent Road"],
  "property.boundary.area": 1232.22,
  "property.boundary.area.hectares": 0.123222,
  "property.boundary": {
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [-0.076691, 51.484197],
            [-0.075933, 51.484124],
            [-0.075856, 51.484369],
            [-0.075889, 51.484372],
            [-0.0759, 51.484324],
            [-0.076391, 51.484369],
            [-0.076388, 51.484383],
            [-0.076644, 51.484409],
            [-0.076691, 51.484197],
          ],
        ],
      ],
    },
    type: "Feature",
    properties: {
      "entry-date": "2023-12-12",
      "start-date": "2011-08-25",
      "end-date": "",
      entity: 12000601059,
      name: "",
      dataset: "title-boundary",
      typology: "geography",
      reference: "52725257",
      prefix: "title-boundary",
      "organisation-entity": "13",
    },
  },
  "findProperty.action": "Proposed a new address",
};

const handlers: Array<HttpHandler | GraphQLHandler> = [
  http.get("https://www.planning.data.gov.uk/*", async () =>
    HttpResponse.json(localAuthorityMock, { status: 200 }),
  ),
  graphql.query("FetchBLPUCodes", () =>
    HttpResponse.json({ data: findAddressReturnMock }),
  ),
];

beforeEach(() => {
  server.use(...handlers);
});

describe("render states", () => {
  it("renders correctly and defaults to the address autocomplete page", async () => {
    const handleSubmit = vi.fn();

    const { user } = await setup(
      <FindProperty
        description="Find your property"
        title="Type your postal code"
        handleSubmit={handleSubmit}
      />,
    );

    // autocomplete does not exist in the DOM on initial render
    expect(
      screen.queryByTestId("address-autocomplete-web-component"),
    ).not.toBeInTheDocument();

    // type a valid postcode
    await user.type(await screen.findByLabelText("Postcode"), "SE5 0HU");

    // expect the autocomplete to be rendered with the correct postcode prop & empty initial address
    const autocomplete = screen.getByTestId(
      "address-autocomplete-web-component",
    );
    expect(autocomplete).toBeInTheDocument();
    expect(autocomplete).toHaveAttribute("postcode", "SE5 0HU");
    expect(autocomplete.getAttribute("initialAddress")).toBeFalsy();

    // expect continue to be disabled because an address has not been selected
    expect(screen.getByTestId("continue-button")).toBeDisabled();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("renders correctly when allowing non-UPRN addresses", async () => {
    const handleSubmit = vi.fn();

    const { user } = await setup(
      <FindProperty
        description="Find your property"
        title="Type your postal code"
        allowNewAddresses={true}
        newAddressTitle="Plot a new address"
        handleSubmit={handleSubmit}
      />,
    );

    // starts on address-autocomplete page
    expect(
      await screen.findByText("Type your postal code"),
    ).toBeInTheDocument();

    // click the link to switch pages
    await user.click(
      await screen.findByText("The site does not have an address"),
    );

    // confirm we've switched pages
    expect(await screen.findByText("Plot a new address")).toBeInTheDocument();

    const map = screen.getByTestId("map-web-component");
    expect(map).toBeInTheDocument();

    const descriptionInput = screen.getByTestId("new-address-input");
    expect(descriptionInput).toBeInTheDocument();

    // Continue button is always enabled, but validation prevents submit until we have complete address details
    expect(screen.getByTestId("continue-button")).toBeEnabled();
    await user.click(screen.getByTestId("continue-button"));
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("renders correctly when non-UPRN address map is set as first page", async () => {
    const handleSubmit = vi.fn();

    const { user } = await setup(
      <FindProperty
        description="Find your property"
        title="Type your postal code"
        allowNewAddresses={true}
        newAddressFirstPage={true}
        newAddressTitle="Plot a new address"
        handleSubmit={handleSubmit}
      />,
    );

    // starts on propose new address page
    expect(await screen.findByText("Plot a new address")).toBeInTheDocument();

    const map = screen.getByTestId("map-web-component");
    expect(map).toBeInTheDocument();

    const descriptionInput = screen.getByTestId("new-address-input");
    expect(descriptionInput).toBeInTheDocument();

    expect(
      await screen.findByText("I want to select an existing address"),
    ).toBeInTheDocument();

    // Continue button is always enabled, but validation prevents submit until we have complete address details
    expect(screen.getByTestId("continue-button")).toBeEnabled();
    await user.click(screen.getByTestId("continue-button"));
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("opens the external planning site dialog by default if allowNewAddresses is toggled off", async () => {
    const handleSubmit = vi.fn();

    const { user } = await setup(
      <FindProperty
        description="Find your property"
        title="Type your postal code"
        allowNewAddresses={false}
        handleSubmit={handleSubmit}
      />,
    );

    await user.click(
      await screen.findByText("The site does not have an address"),
    );

    // confirm we can open & close the dialog
    expect(
      screen.getByTestId("external-planning-site-dialog"),
    ).toBeInTheDocument();
    await user.click(await screen.findByText("Return to application"));

    // land back on the autocomplete page
    expect(
      await screen.findByText("Type your postal code"),
    ).toBeInTheDocument();

    expect(screen.getByTestId("continue-button")).toBeDisabled();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("clears address data when switching between pages", async () => {
    const handleSubmit = vi.fn();
    const previousData = osAddressProps;

    const { user } = await setup(
      <FindProperty
        description="Find your property"
        title="Type your postal code"
        allowNewAddresses
        handleSubmit={handleSubmit}
        previouslySubmittedData={{
          data: previousData,
        }}
      />,
    );

    // confirm that we've landed on the autocomplete page because our address source is "os"
    expect(await screen.findByText("Find your property")).toBeInTheDocument();

    // switch pages
    await user.click(
      await screen.findByText("The site does not have an address"),
    );

    // confirm that site description & coordinates are empty
    const siteDescriptionInput = screen.getByLabelText(
      "Name the site",
    ) as HTMLInputElement;
    expect(siteDescriptionInput).toHaveValue("");

    // expect(screen.getByText("0 Easting")).toBeInTheDocument();
    // expect(screen.getByText("0 Northing")).toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const handleSubmit = vi.fn();
    const { container, user } = await setup(
      <FindProperty
        description="Find your property"
        title="Type your postal code"
        handleSubmit={handleSubmit}
      />,
    );

    await user.type(await screen.findByLabelText("Postcode"), "SE5 0HU");
    // shadow DOM is not rendered, so autocomplete does not actually "open" on typing or account for dropdown options here

    await user.type(
      await screen.findByTestId("address-autocomplete-web-component"),
      "75",
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("picking an OS address", () => {
  it("displays an error if you submit an invalid postcode", async () => {
    const handleSubmit = vi.fn();

    const { user } = await setup(
      <FindProperty
        description="Find your property"
        title="Type your postal code"
        handleSubmit={handleSubmit}
      />,
    );

    await user.type(await screen.findByLabelText("Postcode"), "SE5{enter}");
    expect(screen.getByText(/Enter a valid UK postcode/)).toBeInTheDocument();
  });

  it("updates the address-autocomplete props when the postcode is changed", async () => {
    const { user } = await setup(
      <FindProperty
        description="Find your property"
        title="Type your postal code"
      />,
    );

    // Enter a postcode...
    await user.type(await screen.findByLabelText("Postcode"), "SE5 0HU");

    // Expect autocomplete to be rendered with the correct postcode prop
    expect(
      screen.getByTestId("address-autocomplete-web-component"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("address-autocomplete-web-component"),
    ).toHaveAttribute("postcode", "SE5 0HU");

    // Now go back and change the postcode
    await user.clear(screen.getByLabelText("Postcode"));
    await user.type(screen.getByLabelText("Postcode"), "SE5 0HX");

    // Expect autocomplete to be rendered with the new postcode prop
    expect(
      screen.getByTestId("address-autocomplete-web-component"),
    ).toHaveAttribute("postcode", "SE5 0HX");

    // User is unable to continue and to submit incomplete data
    const continueButton = screen.getByTestId("continue-button");
    expect(continueButton).toBeDisabled();
  });

  it("recovers previously submitted address when clicking the back button", async () => {
    const handleSubmit = vi.fn();
    const previousData = osAddressProps;

    const { user } = await setup(
      <FindProperty
        description="Find your property"
        title="Type your postal code"
        allowNewAddresses
        handleSubmit={handleSubmit}
        previouslySubmittedData={{
          data: previousData,
        }}
      />,
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
    const handleSubmit = vi.fn();

    const { user } = await setup(
      <FindProperty
        description="Find your property"
        title="Type your postal code"
        allowNewAddresses={true}
        newAddressTitle="Plot a new address"
        handleSubmit={handleSubmit}
      />,
    );

    // starts on address-autocomplete page
    expect(
      await screen.findByText("Type your postal code"),
    ).toBeInTheDocument();

    // click the link to switch pages
    await user.click(
      await screen.findByText("The site does not have an address"),
    );

    // confirm we've switched pages
    expect(screen.getByTestId("new-address-input")).toBeInTheDocument();

    // keyUp should trigger the error message to display
    await user.type(await screen.findByLabelText("Name the site"), "{enter}");
    expect(
      screen.getByText(/Enter a site description such as "Land at\.\.\."/),
    ).toBeInTheDocument();

    // Continue button is always enabled, but validation prevents submit until we have complete address details
    expect(screen.getByTestId("continue-button")).toBeEnabled();
    await user.click(screen.getByTestId("continue-button"));
    expect(handleSubmit).not.toHaveBeenCalled();

    // continue should trigger map error wrapper too
    expect(
      screen.getByTestId("error-message-plot-new-address-map"),
    ).toBeInTheDocument();
  });

  it("recovers previously submitted address when clicking the back button and lands on the map page", async () => {
    const handleSubmit = vi.fn();
    const previousData = proposedAddressProps;

    const { user } = await setup(
      <FindProperty
        description="Find your property"
        title="Type your postal code"
        allowNewAddresses
        newAddressTitle="Plot a new address"
        handleSubmit={handleSubmit}
        previouslySubmittedData={{
          data: previousData,
        }}
      />,
    );

    // confirm that we've immediately landed on the map page because our address source is "proposed"
    expect(await screen.findByText("Plot a new address")).toBeInTheDocument();

    await user.click(await screen.findByTestId("continue-button"));
    expect(handleSubmit).toHaveBeenCalledWith({
      data: previousData,
    });
  });
});

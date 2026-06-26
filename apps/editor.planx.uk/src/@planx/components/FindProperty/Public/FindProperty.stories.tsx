import Wrapper from "@planx/components/fixtures/Wrapper";
import { Meta, StoryObj } from "@storybook/tanstack-react";
import { Feature, Polygon } from "geojson";
import { graphql, http, HttpResponse } from "msw";
import { useStore } from "pages/FlowEditor/lib/store";
import { waitFor } from "storybook/test";

import Editor from "../Editor";
import FindProperty from ".";
import fetchBLPUCodesMock from "./mocks/findAddressReturnMock";
import localAuthorityMock from "./mocks/localAuthorityMock";
import osDatastoreErrorMock from "./mocks/osDatastoreErrorMock";

const camdenBoundaryBBox: Feature<Polygon> = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [-0.166, 51.535],
        [-0.12, 51.535],
        [-0.12, 51.557],
        [-0.166, 51.557],
        [-0.166, 51.535],
      ],
    ],
  },
};

const setTeamBoundaryBBox = (boundaryBBox: Feature<Polygon> | undefined) => {
  useStore.setState({
    teamSettings: { ...useStore.getState().teamSettings, boundaryBBox },
  });
  return () =>
    useStore.setState({
      teamSettings: {
        ...useStore.getState().teamSettings,
        boundaryBBox: undefined,
      },
    });
};

/** FindProperty relies on a custom web component that cannot be shown by React Storybook. Find additional docs here: https://oslmap.netlify.app/ */
export default {
  title: "PlanX Components/FindProperty",
  component: FindProperty,
  parameters: {
    msw: {
      handlers: [
        http.get("https://www.planning.data.gov.uk/*", async () =>
          HttpResponse.json(localAuthorityMock, { status: 200 }),
        ),
        graphql.query("FetchBLPUCodes", () =>
          HttpResponse.json({ data: fetchBLPUCodesMock }),
        ),
      ],
    },
  },
} satisfies Meta<typeof FindProperty>;

export const EmptyForm: StoryObj = {
  render: () => (
    <FindProperty
      title="Find your property"
      description="For example, SE5 0HU"
    />
  ),
};

export const OSDatastoreError: StoryObj = {
  parameters: {
    msw: {
      handlers: [
        http.get("*/proxy/ordnance-survey/search/places/v1/postcode", () =>
          HttpResponse.json(osDatastoreErrorMock, { status: 500 }),
        ),
      ],
    },
  },
  render: () => (
    <FindProperty
      title="Enter the postcode of the property"
      description="For example, HP9 2HA"
    />
  ),
};

/**
 * The "propose a new address" page, which renders an interactive map with the
 * OS address search box enabled (`showOSSearch`). Searching for an address
 * re-centres the map to help the applicant place their point.
 */
export const PlotNewAddressWithOSSearch: StoryObj = {
  beforeEach: () => setTeamBoundaryBBox(undefined),
  render: () => (
    <FindProperty
      newAddressFirstPage
      newAddressTitle="Propose a new address"
      newAddressDescription="Search for an address or click the map to place a point"
      title="Find your property"
      description="For example, SE5 0HU"
    />
  ),
};

/**
 * Searching for an address that falls outside the team boundary. The map keeps
 * the applicant inside the team's area by rejecting the selection and showing
 * an inline error rather than re-centring.
 */
export const SearchAddressOutsideBoundary: StoryObj = {
  beforeEach: () => setTeamBoundaryBBox(camdenBoundaryBBox),
  render: () => (
    <FindProperty
      newAddressFirstPage
      newAddressTitle="Propose a new address"
      newAddressDescription="Search for an address or click the map to place a point"
      title="Find your property"
      description="For example, SE5 0HU"
    />
  ),
  play: async ({ canvasElement }) => {
    const map = canvasElement.querySelector<HTMLElement>(
      '[data-testid="map-web-component"]',
    );

    const geocoder = await waitFor(() => {
      const el = map?.shadowRoot?.querySelector("geocode-autocomplete");
      if (!el) throw new Error("Geocoder not yet rendered");
      return el;
    });

    // Dispatch the selection event directly to trigger the error state
    await waitFor(() => {
      geocoder.dispatchEvent(
        new CustomEvent("addressSelection", {
          detail: { address: { LPI: { LNG: 2.3522, LAT: 48.8566 } } },
        }),
      );
    });
  },
};

export const WithEditor = () => {
  return (
    <Wrapper
      Editor={Editor}
      Public={() => (
        <FindProperty
          title="Find your property"
          description="For example, SE5 0HU"
        />
      )}
    />
  );
};

import { MyMap } from "@opensystemslab/map";
import { Presentational as MapAndLabel } from "@planx/components/MapAndLabel/Public";
import { waitFor } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import { point1 } from "../test/mocks/geojson";
import { props } from "../test/mocks/Trees";
import { addFeaturesToMap } from "../test/utils";

beforeAll(() => {
  if (!window.customElements.get("my-map")) {
    window.customElements.define("my-map", MyMap);
  }

  const ResizeObserverMock = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
});

describe("Basic UI", () => {
  it("renders correctly", () => {
    const { getByText } = setup(<MapAndLabel {...props} />);

    expect(getByText(/Mock title/)).toBeInTheDocument();
    expect(getByText(/Mock description/)).toBeInTheDocument();
  });

  it("shows the user a prompt to begin the plotting interaction", async () => {
    const { getByText } = setup(<MapAndLabel {...props} />);
    expect(getByText("Plot a feature on the map to begin")).toBeInTheDocument();
  });

  it("removes the prompt once a feature is added", async () => {
    const { queryByText, getByTestId } = setup(<MapAndLabel {...props} />);
    const map = getByTestId("map-and-label-map");
    expect(map).toBeInTheDocument();

    addFeaturesToMap(map, [point1]);

    await waitFor(() =>
      expect(
        queryByText("Plot a feature on the map to begin"),
      ).not.toBeInTheDocument(),
    );
  });

  it("renders the schema name as the tab title", async () => {
    const { queryByText, getByRole, getByTestId } = setup(
      <MapAndLabel {...props} />,
    );
    expect(queryByText(/Tree 1/)).not.toBeInTheDocument();

    const map = getByTestId("map-and-label-map");
    expect(map).toBeInTheDocument();

    addFeaturesToMap(map, [point1]);

    expect(getByRole("tab", { name: /Tree 1/ })).toBeInTheDocument();
    expect(getByRole("heading", { name: /Tree 1/ })).toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const { queryByText, getByTestId, container } = setup(
      <MapAndLabel {...props} />,
    );
    expect(queryByText(/Tree 1/)).not.toBeInTheDocument();

    const map = getByTestId("map-and-label-map");
    expect(map).toBeInTheDocument();

    addFeaturesToMap(map, [point1]);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// Schema and field validation is handled in both List and Schema folders - here we're only testing the MapAndLabel specific error handling
describe("validation and error handling", () => {
  test.todo("all fields are required");
  test.todo("all fields are required, for all feature tabs");
  test.todo("an error displays if the minimum number of items is not met");
  test.todo("an error displays if the maximum number of items is exceeded");
  test.todo(
    "an error state is applied to a tabpanel button, when it's associated feature is invalid",
  );
});

describe("basic interactions - happy path", () => {
  test.todo("adding an item to the map adds a feature tab");
  test.todo("a user can input details on a single feature and submit");
  test.todo("adding multiple features to the map adds multiple feature tabs");
  test.todo("a user can input details on multiple features and submit");
  test.todo("a user can input details on feature tabs in any order");
});

describe("copy feature select", () => {
  it.todo("is disabled if only a single feature is present");
  it.todo("is enabled once multiple features are present");
  it.todo(
    "lists all other features as options (the current feature is not listed)",
  );
  it.todo("copies all data from one feature to another");
  it.todo("should not have any accessibility violations");
});

describe("remove feature button", () => {
  it.todo("removes a feature from the form");
  it.todo("removes a feature from the map");
});

describe("payload generation", () => {
  test.todo("a submitted payload contains a GeoJSON feature collection");
  test.todo(
    "the feature collection contains all geospatial data inputted by the user",
  );
  test.todo(
    "each feature's properties correspond with the details entered for that feature",
  );
});

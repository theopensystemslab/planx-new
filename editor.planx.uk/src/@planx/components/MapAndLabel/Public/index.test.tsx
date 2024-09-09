import { MyMap } from "@opensystemslab/map";
import { Presentational as MapAndLabel } from "@planx/components/MapAndLabel/Public";
import { waitFor, within } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import { point1, point2 } from "../test/mocks/geojson";
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
        queryByText("Plot a feature on the map to begin")
      ).not.toBeInTheDocument()
    );
  });

  it("renders the schema name as the tab title", async () => {
    const { queryByText, getByRole, getByTestId } = setup(
      <MapAndLabel {...props} />
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
      <MapAndLabel {...props} />
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
  it("shows all fields are required", async () => {
    const { getAllByTestId, getByTestId, getByRole, user } = setup(
      <MapAndLabel {...props} />
    );
    const map = getByTestId("map-and-label-map");
    expect(map).toBeInTheDocument();

    addFeaturesToMap(map, [point1]);

    expect(getByRole("tab", { name: /Tree 1/ })).toBeInTheDocument();

    const continueButton = getByRole("button", { name: /Continue/ });

    user.click(continueButton);

    const errorMessages = getAllByTestId(/error-message-input/);

    // 5 error message inputs + 3 for date inputs (one per input and one wrapper)
    expect(errorMessages).toHaveLength(8);

    errorMessages.forEach((message) => {
      expect(message).toBeEmptyDOMElement();
    });
  });
  // it shows all fields are required in a tab
  it("should show all fields are required, for all feature tabs", async () => {
    const { getByTestId, getByRole, user } = setup(<MapAndLabel {...props} />);
    const map = getByTestId("map-and-label-map");
    expect(map).toBeInTheDocument();

    addFeaturesToMap(map, [point1, point2]);

    // vertical side tabs... problem is with definition of tab
    const firstTab = getByRole("tab", { name: /Tree 1/ });
    const secondTab = getByRole("tab", { name: /Tree 2/ });

    expect(firstTab).toBeInTheDocument();
    expect(secondTab).toBeInTheDocument();

    expect(secondTab.tagName.toLowerCase()).toBe("button");

    // form for each tab
    const firstTabPanel = getByTestId("vertical-tabpanel-0");
    const secondTabPanel = getByTestId("vertical-tabpanel-1");

    expect(firstTabPanel.childElementCount).toBeGreaterThan(0);

    // default is to start on first tab panel, second is hidden
    expect(firstTabPanel).toBeVisible();
    expect(secondTabPanel).not.toBeVisible();

    // click continue
    const continueButton = getByRole("button", { name: /Continue/ });
    // await user.click(continueButton);

    // error messages appear
    const errorMessagesOne =
      within(firstTabPanel).getAllByTestId(/error-message-input/);
    expect(errorMessagesOne).toHaveLength(8);

    // click to go to the second tab
    await user.click(secondTab);

    // first tab panel (form) should no longer be visible
    expect(firstTabPanel.hidden).toBeFalsy();
    expect(secondTabPanel.hidden).toBeTruthy();

    await waitFor(
      () => {
        expect(secondTabPanel.hidden).toBeFalsy();
      },
      { timeout: 4000 }
    );
  });

  // it shows all fields are required across different tabs
  it("should show an error if the minimum number of items is not met", async () => {
    const { getByTestId, getByRole, user, getByText } = setup(
      <MapAndLabel {...props} />
    );
    const map = getByTestId("map-and-label-map");
    expect(map).toBeInTheDocument();

    const continueButton = getByRole("button", { name: /Continue/ });

    await user.click(continueButton);

    const errorWrapper = getByTestId(/error-wrapper/);

    const errorMessage = getByText(/You must plot /);
  });
  // ??
  test.todo(
    "an error state is applied to a tabpanel button, when it's associated feature is invalid"
  );
  // shows the error state on a tab when it's invalid
});

describe("basic interactions - happy path", () => {
  test.todo("adding an item to the map adds a feature tab");
  // add feature, see a tab (one feature only)
  test.todo("a user can input details on a single feature and submit");
  // only one feature, fill out form, submit
  test.todo("adding multiple features to the map adds multiple feature tabs");
  // add more than one feature, see multiple tabs
  test.todo("a user can input details on multiple features and submit");
  // add details to more than one tab, submit
  test.todo("a user can input details on feature tabs in any order");
  // ??
});

describe("copy feature select", () => {
  it.todo("is disabled if only a single feature is present");
  // no copy select if only one feature
  it.todo("is enabled once multiple features are present");
  // copy select enabled once you add more features
  it.todo(
    "lists all other features as options (the current feature is not listed)"
  );
  // current tree is not an option in the copy select
  it.todo("copies all data from one feature to another");
  // all data fields are populated from one field to another
  it.todo("should not have any accessibility violations");
  // axe checks
});

describe("remove feature button", () => {
  it.todo("removes a feature from the form");
  // click remove - feature is removed
  // not tab
  it.todo("removes a feature from the map");
  // click remove - feature is removed
  // no map icon
});

describe("payload generation", () => {
  test.todo("a submitted payload contains a GeoJSON feature collection");
  // check payload contains GeoJSON feature collection
  test.todo(
    "the feature collection contains all geospatial data inputted by the user"
  );
  // feature collection matches the mocked data
  test.todo(
    "each feature's properties correspond with the details entered for that feature"
  );
  // feature properties contain the answers to inputs
});

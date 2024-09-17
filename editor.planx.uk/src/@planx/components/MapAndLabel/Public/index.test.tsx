import { MyMap } from "@opensystemslab/map";
import { Presentational as MapAndLabel } from "@planx/components/MapAndLabel/Public";
import { screen, waitFor, within } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import { point1, point2, point3 } from "../test/mocks/geojson";
import { props } from "../test/mocks/Trees";
import {
  addFeaturesToMap,
  addMultipleFeatures,
  checkErrorMessagesEmpty,
  checkErrorMessagesPopulated,
  clickContinue,
  fillOutFirstHalfOfForm,
  fillOutForm,
  fillOutSecondHalfOfForm,
} from "../test/utils";

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

    addFeaturesToMap(map, [point1]);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// Schema and field validation is handled in both List and Schema folders - here we're only testing the MapAndLabel specific error handling
describe("validation and error handling", () => {
  it("shows all fields are required", async () => {
    const { getByTestId, user, queryByRole, getAllByTestId } = setup(
      <MapAndLabel {...props} />
    );
    const map = getByTestId("map-and-label-map");

    addFeaturesToMap(map, [point1]);

    const tabOne = queryByRole("tab", { name: /Tree 1/ });
    expect(tabOne).toBeInTheDocument();

    const firstTabPanel = getByTestId("vertical-tabpanel-0");
    const firstSpeciesInput = within(firstTabPanel).getByLabelText("Species");

    // check input is empty
    expect(firstSpeciesInput).toHaveDisplayValue("");

    await clickContinue(user);

    const errorMessages = getAllByTestId(/error-message-input/);

    expect(errorMessages).toHaveLength(4);

    errorMessages.forEach((message) => {
      expect(message).not.toBeEmptyDOMElement();
    });
  });

  // it shows all fields are required in a tab
  it("should show all fields are required, for all feature tabs", async () => {
    const { getByTestId, getByRole, user } = setup(<MapAndLabel {...props} />);

    addMultipleFeatures([point1, point2]);

    // vertical side tab query
    const firstTab = getByRole("tab", { name: /Tree 1/ });

    // form for each tab
    const firstTabPanel = getByTestId("vertical-tabpanel-0");
    const secondTabPanel = getByTestId("vertical-tabpanel-1");

    // default is to start on second tab panel since we add two points
    expect(firstTabPanel).not.toBeVisible();
    expect(secondTabPanel).toBeVisible();

    // Form is generate for secondTabPanel but not the first
    expect(secondTabPanel.childElementCount).toBeGreaterThan(0);
    expect(firstTabPanel.childElementCount).toBe(0);

    await clickContinue(user);

    // error messages appear
    await checkErrorMessagesPopulated();

    await user.click(firstTab);

    expect(firstTabPanel).toBeVisible();

    // error messages persist
    await checkErrorMessagesPopulated();
  });

  // it shows all fields are required across different tabs
  it("should show an error if the minimum number of items is not met", async () => {
    const { getByTestId, user } = setup(<MapAndLabel {...props} />);

    await clickContinue(user);

    const errorWrapper = getByTestId(/error-wrapper/);

    const errorMessage = within(errorWrapper).getByText(/You must plot /);
    expect(errorMessage).toBeVisible();
  });
  // ??
  it("an error state is applied to a tabpanel button, when it's associated feature is invalid", async () => {
    const { getByTestId, user, queryByRole } = setup(
      <MapAndLabel {...props} />
    );
    const map = getByTestId("map-and-label-map");

    addFeaturesToMap(map, [point1]);

    const tabOne = queryByRole("tab", { name: /Tree 1/ });

    expect(tabOne).toBeInTheDocument();

    await clickContinue(user);

    await checkErrorMessagesPopulated();

    expect(tabOne).toHaveStyle("border-left: 5px solid #D4351C");
  });
  // shows the error state on a tab when it's invalid
});

it("does not trigger handleSubmit when errors exist", async () => {
  const handleSubmit = vi.fn();
  const { getByTestId, user } = setup(
    <MapAndLabel {...props} handleSubmit={handleSubmit} />
  );
  const map = getByTestId("map-and-label-map");

  addFeaturesToMap(map, [point1]);

  await clickContinue(user);

  await checkErrorMessagesPopulated();

  expect(handleSubmit).not.toBeCalled();
});
test.todo("an error displays if the maximum number of items is exceeded");

describe("basic interactions - happy path", () => {
  it("adding an item to the map adds a feature tab", async () => {
    const { getByTestId } = setup(<MapAndLabel {...props} />);
    const map = getByTestId("map-and-label-map");

    addFeaturesToMap(map, [point1]);

    const firstTabPanel = getByTestId("vertical-tabpanel-0");

    expect(firstTabPanel).toBeVisible();
  });

  it("a user can input details on a single feature and submit", async () => {
    const { getByTestId, user } = setup(<MapAndLabel {...props} />);

    const map = getByTestId("map-and-label-map");

    addFeaturesToMap(map, [point1]);

    const firstTabPanel = getByTestId("vertical-tabpanel-0");

    expect(firstTabPanel).toBeVisible();

    await fillOutForm(user);

    await clickContinue(user);

    await checkErrorMessagesEmpty();
  });

  it("adding multiple features to the map adds multiple feature tabs", async () => {
    const { queryByRole } = setup(<MapAndLabel {...props} />);

    addMultipleFeatures([point1, point2, point3]);

    // vertical side tab query
    const firstTab = queryByRole("tab", { name: /Tree 1/ });
    const secondTab = queryByRole("tab", { name: /Tree 2/ });
    const thirdTab = queryByRole("tab", { name: /Tree 3/ });
    const fourthTab = queryByRole("tab", { name: /Tree 4/ });

    // check the right amount are in the document
    expect(firstTab).toBeInTheDocument();
    expect(secondTab).toBeInTheDocument();
    expect(thirdTab).toBeInTheDocument();
    expect(fourthTab).not.toBeInTheDocument();

    expect(firstTab).toHaveAttribute("aria-selected", "false");
    expect(secondTab).toHaveAttribute("aria-selected", "false");
    expect(thirdTab).toHaveAttribute("aria-selected", "true");
  });

  it("a user can input details on multiple features and submit", async () => {
    const { getByTestId, getByRole, user } = setup(<MapAndLabel {...props} />);
    getByTestId("map-and-label-map");

    addMultipleFeatures([point1, point2]);

    // vertical side tab query
    const firstTab = getByRole("tab", { name: /Tree 1/ });
    const firstTabPanel = getByTestId("vertical-tabpanel-0");
    const secondTabPanel = getByTestId("vertical-tabpanel-1");

    await fillOutForm(user);
    const secondSpeciesInput = within(secondTabPanel).getByLabelText("Species");

    expect(secondSpeciesInput).toHaveDisplayValue("Larch");

    await user.click(firstTab);

    // check form on screen is reset
    const firstSpeciesInput = within(firstTabPanel).getByLabelText("Species");
    expect(secondSpeciesInput).not.toBeInTheDocument();
    expect(firstSpeciesInput).not.toHaveDisplayValue("Larch");

    await fillOutForm(user);

    await clickContinue(user);

    await checkErrorMessagesEmpty();
  });
  it("a user can input details on feature tabs in any order", async () => {
    const { getByTestId, getByRole, user } = setup(<MapAndLabel {...props} />);

    addMultipleFeatures([point1, point2]);

    const firstTab = getByRole("tab", { name: /Tree 1/ });
    const secondTab = getByRole("tab", { name: /Tree 2/ });

    const firstTabPanel = getByTestId("vertical-tabpanel-0");
    const secondTabPanel = getByTestId("vertical-tabpanel-1");

    await user.click(firstTab);

    const firstSpeciesInput = within(firstTabPanel).getByLabelText("Species");
    expect(firstSpeciesInput).not.toHaveDisplayValue("Larch");

    // partially fill out firstTabPanel
    await fillOutFirstHalfOfForm(user);

    await user.click(secondTab);
    const secondSpeciesInput = within(secondTabPanel).getByLabelText("Species");
    expect(secondSpeciesInput).not.toHaveDisplayValue("Larch");

    // partially fill out secondTabPanel
    await fillOutFirstHalfOfForm(user);

    await user.click(firstTab);

    // check that the data stays within the firstTabPanel
    expect(firstSpeciesInput).toHaveDisplayValue("Larch");

    // Complete the filling out of the firstTabPanel
    await fillOutSecondHalfOfForm(user);

    await user.click(secondTab);

    // check that the data stays within the secondTabPanel
    expect(secondSpeciesInput).toHaveDisplayValue("Larch");

    // Complete the filling out of the secondTabPanel
    await fillOutSecondHalfOfForm(user);

    await clickContinue(user);

    await checkErrorMessagesEmpty();
  });
});

describe("copy feature select", () => {
  it("is disabled if only a single feature is present", async () => {
    const { getByTestId, getByTitle } = setup(<MapAndLabel {...props} />);
    const map = getByTestId("map-and-label-map");

    addFeaturesToMap(map, [point1]);

    const copyTitle = getByTitle("Copy from");

    const copyInput = within(copyTitle).getByRole("combobox");

    expect(copyInput).toHaveAttribute("aria-disabled", "true");
  });
  // no copy select if only one feature
  it("is enabled once multiple features are present", async () => {
    const { getByTestId, getByTitle } = setup(<MapAndLabel {...props} />);
    const map = getByTestId("map-and-label-map");
    addMultipleFeatures([point1, point2]);

    const copyTitle = getByTitle("Copy from");

    const copyInput = within(copyTitle).getByRole("combobox");

    expect(copyInput).not.toHaveAttribute("aria-disabled", "true");
  });
  // copy select enabled once you add more features
  it("lists all other features as options (the current feature is not listed)", async () => {
    const { getByTestId, getByTitle, user, queryByRole } = setup(
      <MapAndLabel {...props} />
    );
    const map = getByTestId("map-and-label-map");
    addMultipleFeatures([point1, point2]);

    const copyTitle = getByTitle("Copy from");

    const copyInput = within(copyTitle).getByRole("combobox");

    expect(copyInput).not.toHaveAttribute("aria-disabled", "true");

    await user.click(copyInput);

    // Current item would be Tree 2 since we added two points
    const listItemTwo = queryByRole("option", { name: "Tree 2" });

    expect(listItemTwo).not.toBeInTheDocument();
  });
  // current tree is not an option in the copy select
  it("copies all data from one feature to another", async () => {
    const { getByTestId, getByTitle, user, getByLabelText, getByRole } = setup(
      <MapAndLabel {...props} />
    );
    const map = getByTestId("map-and-label-map");
    addMultipleFeatures([point1, point2]);
    const tabOne = getByRole("tab", { name: /Tree 1/ });

    await fillOutForm(user);

    const speciesInputTwo = getByLabelText("Species");
    const workInputTwo = getByLabelText("Proposed work");
    const justificationInputTwo = getByLabelText("Justification");
    const urgencyDivTwo = getByTitle("Urgency");
    const urgencySelectTwo = within(urgencyDivTwo).getByRole("combobox");

    expect(speciesInputTwo).toHaveDisplayValue("Larch");
    expect(workInputTwo).toHaveDisplayValue("Chopping it down");
    expect(justificationInputTwo).toHaveDisplayValue("Cause I can");
    expect(urgencySelectTwo).toHaveTextContent("Low");

    await user.click(tabOne);

    const copyTitle = getByTitle("Copy from");

    const copyInput = within(copyTitle).getByRole("combobox", {
      name: "Copy from",
    });
    await user.click(copyInput);
    const listItemTwo = getByRole("option", { name: "Tree 2" });

    await user.click(listItemTwo);

    const speciesInputOne = getByLabelText("Species");
    const workInputOne = getByLabelText("Proposed work");
    const justificationInputOne = getByLabelText("Justification");
    const urgencyDivOne = getByTitle("Urgency");
    const urgencySelectOne = within(urgencyDivOne).getByRole("combobox");

    expect(speciesInputOne).toHaveDisplayValue("Larch");
    expect(workInputOne).toHaveDisplayValue("Chopping it down");
    expect(justificationInputOne).toHaveDisplayValue("Cause I can");
    expect(urgencySelectOne).toHaveTextContent("Low");
  });
  // all data fields are populated from one field to another
  it("should not have any accessibility violations", async () => {
    const { getByTestId, getByTitle, user, container } = setup(
      <MapAndLabel {...props} />
    );
    const map = getByTestId("map-and-label-map");
    addMultipleFeatures([point1, point2]);

    const copyTitle = getByTitle("Copy from");

    const copyInput = within(copyTitle).getByRole("combobox");

    expect(copyInput).not.toHaveAttribute("aria-disabled", "true");

    await user.click(copyInput);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
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

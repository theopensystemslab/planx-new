import * as planxCore from "@opensystemslab/planx-core";
import { waitFor, within } from "@testing-library/react";
import { FullStore, useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { act } from "react-dom/test-utils";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

const mockNavigate = vi.fn();

vi.mock("react-navi", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

import Search from ".";
import { flow } from "./mocks/simple";
import { VirtuosoWrapper } from "./testUtils";

const { setState, getState } = useStore;

let initialState: FullStore;

beforeAll(() => (initialState = getState()));

beforeEach(() => setState({ flow }));
afterEach(() => act(() => setState(initialState)));

vi.mock("@opensystemslab/planx-core", async (originalModule) => {
  const actualModule = await originalModule<typeof planxCore>();
  return {
    ...actualModule,
    // Spy on sortFlow while keeping its original implementation
    sortFlow: vi.fn(actualModule.sortFlow),
  };
});

test("data field checkbox is unchecked and enabled by default", () => {
  const { getByLabelText } = setup(
    <VirtuosoWrapper>
      <Search />
    </VirtuosoWrapper>,
  );
  const checkbox = getByLabelText("Search only data fields");

  expect(checkbox).toBeInTheDocument();
  expect(checkbox).not.toBeChecked();
  expect(checkbox).not.toBeDisabled();
});

test("entering a search term displays a series of cards", async () => {
  const { user, queryByRole, getByRole, getAllByRole, getByLabelText } = setup(
    <VirtuosoWrapper>
      <Search />
    </VirtuosoWrapper>,
  );

  expect(queryByRole("list")).toBeEmptyDOMElement();

  const searchInput = getByLabelText("Search this flow and internal portals");
  user.type(searchInput, "ind");

  await waitFor(() => expect(getByRole("list")).toBeInTheDocument());
  await waitFor(() => expect(getAllByRole("listitem")).toHaveLength(2));
});

test("cards link to their associated nodes", async () => {
  const { user, getAllByRole, getByLabelText } = setup(
    <VirtuosoWrapper>
      <Search />
    </VirtuosoWrapper>,
  );

  const searchInput = getByLabelText("Search this flow and internal portals");
  user.type(searchInput, "ind");

  await waitFor(() => expect(getAllByRole("listitem")).toHaveLength(2));

  const [first, second] = getAllByRole("listitem");
  const urlToParentQuestion = "nodes/_root/nodes/Ej0xpn4l8u/edit";

  const firstItemButton = within(first).getByRole("button");
  await user.click(firstItemButton);
  expect(mockNavigate).toHaveBeenCalledWith(
    expect.stringContaining(urlToParentQuestion),
  );

  const secondItemButton = within(second).getByRole("button");
  await user.click(secondItemButton);
  expect(mockNavigate).toHaveBeenCalledWith(
    expect.stringContaining(urlToParentQuestion),
  );
});

it("orderedFlow is set in the store on render of Search", async () => {
  expect(getState().orderedFlow).toBeUndefined();

  setup(
    <VirtuosoWrapper>
      <Search />
    </VirtuosoWrapper>,
  );

  expect(getState().orderedFlow).toBeDefined();
});

test("setOrderedFlow is only called once on initial render", async () => {
  const sortFlowSpy = vi.spyOn(planxCore, "sortFlow");
  expect(sortFlowSpy).not.toHaveBeenCalled();

  const { user, getAllByRole, getByLabelText } = setup(
    <VirtuosoWrapper>
      <Search />
    </VirtuosoWrapper>,
  );

  const searchInput = getByLabelText("Search this flow and internal portals");
  user.type(searchInput, "ind");

  await waitFor(() => expect(getAllByRole("listitem")).toHaveLength(2));

  expect(sortFlowSpy).toHaveBeenCalledTimes(1);
});

it("should not have any accessibility violations on initial load", async () => {
  const { container } = setup(
    <VirtuosoWrapper>
      <Search />
    </VirtuosoWrapper>,
  );

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

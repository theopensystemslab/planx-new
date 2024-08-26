import * as planxCore from "@opensystemslab/planx-core";
import { waitFor } from "@testing-library/react";
import { FullStore, useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { act } from "react-dom/test-utils";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import Search from ".";
import { flow } from "./mocks/simple";

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

test("data field checkbox is checked and disabled", () => {
  const { getByLabelText } = setup(<Search />);
  const checkbox = getByLabelText("Search only data fields");

  expect(checkbox).toBeInTheDocument();
  expect(checkbox).toBeChecked();
  expect(checkbox).toBeDisabled();
});

test("entering a search term displays a series of cards", async () => {
  const { user, queryByRole, getByRole, getAllByRole, getByLabelText } = setup(
    <Search />,
  );

  expect(queryByRole("list")).not.toBeInTheDocument();

  const searchInput = getByLabelText("Search this flow and internal portals");
  user.type(searchInput, "ind");

  await waitFor(() => expect(getByRole("list")).toBeInTheDocument());
  await waitFor(() => expect(getAllByRole("listitem")).toHaveLength(2));
});

test.todo("cards link to their associated nodes", async () => {
  const { user, getAllByRole, getByLabelText } = setup(<Search />);

  const searchInput = getByLabelText("Search this flow and internal portals");
  user.type(searchInput, "ind");

  await waitFor(() => expect(getAllByRole("listitem")).toHaveLength(2));

  const [first, second] = getAllByRole("listitem");
  // TODO!
  expect(first).toHaveAttribute("href", "link to tR9tdaWOvF (India)");
  expect(second).toHaveAttribute("href", "link to tvUxd2IoPo (Indonesia)");
});

it("orderedFlow is set in the store on render of Search", async () => {
  expect(getState().orderedFlow).toBeUndefined();

  setup(<Search />);

  expect(getState().orderedFlow).toBeDefined();
});

test("setOrderedFlow is only called once on initial render", async () => {
  const sortFlowSpy = vi.spyOn(planxCore, "sortFlow");
  expect(sortFlowSpy).not.toHaveBeenCalled();

  const { user, getAllByRole, getByLabelText } = setup(<Search />);

  const searchInput = getByLabelText("Search this flow and internal portals");
  user.type(searchInput, "ind");

  await waitFor(() => expect(getAllByRole("listitem")).toHaveLength(2));

  expect(sortFlowSpy).toHaveBeenCalledTimes(1);
});

it("should not have any accessibility violations on initial load", async () => {
  const { container } = setup(<Search />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

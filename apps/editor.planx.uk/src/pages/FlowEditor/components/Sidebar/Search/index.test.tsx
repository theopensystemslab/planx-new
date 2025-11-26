import * as planxCore from "@opensystemslab/planx-core";
import { waitFor, within } from "@testing-library/react";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

const mockNavigate = vi.fn();

vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual("@tanstack/react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import Search from ".";
import { flow } from "./mocks/simple";
import { VirtuosoWrapper } from "./testUtils";

const { setState, getState } = useStore;

beforeEach(() => {
  setState({ flow, orderedFlow: undefined });
});

vi.mock("@opensystemslab/planx-core", async (originalModule) => {
  const actualModule = await originalModule<typeof planxCore>();
  return {
    ...actualModule,
    // Spy on sortFlow while keeping its original implementation
    sortFlow: vi.fn(actualModule.sortFlow),
  };
});

test("data field checkbox is unchecked and enabled by default", async () => {
  const { getByLabelText } = await setup(
    <VirtuosoWrapper>
      <Search />
    </VirtuosoWrapper>,
  );
  const checkbox = getByLabelText("Search only data fields");

  expect(checkbox).toBeInTheDocument();
  expect(checkbox).not.toBeChecked();
  expect(checkbox).toBeEnabled();
});

test("entering a search term displays a series of cards", async () => {
  const { user, queryByRole, getByRole, getAllByRole, getByLabelText } =
    await setup(
      <VirtuosoWrapper>
        <Search />
      </VirtuosoWrapper>,
    );

  expect(queryByRole("list")).toBeEmptyDOMElement();

  const searchInput = getByLabelText("Search this flow");
  user.type(searchInput, "ind");

  await waitFor(() => expect(getByRole("list")).toBeInTheDocument());
  await waitFor(() => expect(getAllByRole("listitem")).toHaveLength(2));
});

test("cards link to their associated nodes", async () => {
  const { user, getAllByRole, getByLabelText } = await setup(
    <VirtuosoWrapper>
      <Search />
    </VirtuosoWrapper>,
  );

  const searchInput = getByLabelText("Search this flow");
  user.type(searchInput, "ind");

  await waitFor(() => expect(getAllByRole("listitem")).toHaveLength(2));

  const [first, second] = getAllByRole("listitem");
  const urlToParentQuestion = "nodes/_root/nodes/Ej0xpn4l8u/edit";

  const firstItemButton = within(first).getByRole("button");
  await user.click(firstItemButton);
  expect(mockNavigate).toHaveBeenCalledWith(
    expect.objectContaining({
      to: expect.stringContaining(urlToParentQuestion),
    }),
  );

  const secondItemButton = within(second).getByRole("button");
  await user.click(secondItemButton);
  expect(mockNavigate).toHaveBeenCalledWith(
    expect.objectContaining({
      to: expect.stringContaining(urlToParentQuestion),
    }),
  );
});

it("orderedFlow is set in the store on render of Search", async () => {
  expect(getState().orderedFlow).toBeUndefined();

  await setup(
    <VirtuosoWrapper>
      <Search />
    </VirtuosoWrapper>,
  );

  expect(getState().orderedFlow).toBeDefined();
});

test("setOrderedFlow is only called once on initial render", async () => {
  const sortFlowSpy = vi.spyOn(planxCore, "sortFlow");
  expect(sortFlowSpy).not.toHaveBeenCalled();

  const { user, getAllByRole, getByLabelText } = await setup(
    <VirtuosoWrapper>
      <Search />
    </VirtuosoWrapper>,
  );

  const searchInput = getByLabelText("Search this flow");
  user.type(searchInput, "ind");

  await waitFor(() => expect(getAllByRole("listitem")).toHaveLength(2));

  expect(sortFlowSpy).toHaveBeenCalledTimes(1);
});

it("should not have any accessibility violations on initial load", async () => {
  const { container } = await setup(
    <VirtuosoWrapper>
      <Search />
    </VirtuosoWrapper>,
  );

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

describe("rich text fields", () => {
  test("HTML tags are stripped out", async () => {
    const {
      user,
      getByRole,
      getAllByRole,
      getByText,
      queryByText,
      getByLabelText,
    } = await setup(
      <VirtuosoWrapper>
        <Search />
      </VirtuosoWrapper>,
    );

    const searchInput = getByLabelText("Search this flow");
    user.type(searchInput, "rich text");

    // Search has completed
    await waitFor(() => expect(getByRole("list")).toBeInTheDocument());
    await waitFor(() => expect(getAllByRole("listitem")).toHaveLength(1));

    // Single, correct, search result returned which has rich text as a description
    expect(getByText(/1 result:/)).toBeVisible();
    expect(getByText(/Pick a country/)).toBeVisible();
    expect(getByText(/Description/)).toBeVisible();

    // No HTML tags in text
    // We must search by characters and not strings (e.g </h1>) as the string is split for the headline
    expect(queryByText(/</)).not.toBeInTheDocument();
    expect(queryByText(/>/)).not.toBeInTheDocument();
    expect(queryByText(/\//)).not.toBeInTheDocument();
  });
});

import * as planxCore from "@opensystemslab/planx-core";
import { waitFor, within } from "@testing-library/react";
import type { AttachedNote } from "hooks/data/useFlowNotes";
import { FlowNotesContext } from "pages/FlowEditor/components/Flow/notes/FlowNotesContext";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { setup } from "test/utils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

const mockNavigate = vi.fn();
const mockUseParams = vi.fn(() => ({ team: "test-team", flow: "test-flow" }));

vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual("@tanstack/react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
  };
});

import Search from ".";
import { flow } from "./mocks/simple";
import { VirtuosoWrapper } from "./testUtils";

const mockNote: AttachedNote = {
  positionId: "note-1",
  contentId: "note-content-1",
  flowId: "test-flow-id",
  nodeId: "Ej0xpn4l8u",
  placement: null,
  text: "Sample note text",
  createdBy: 1,
  updatedBy: 1,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

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

describe("notes", () => {
  const withNote = (children: React.ReactNode) => (
    <FlowNotesContext.Provider
      value={{
        attached: new Map([[mockNote.nodeId, [mockNote]]]),
        positioned: new Map(),
        loading: false,
        clonedContentIds: new Set(),
      }}
    >
      {children}
    </FlowNotesContext.Provider>
  );

  test("a matching note is included alongside node results", async () => {
    const { user, getAllByRole, getByLabelText } = await setup(
      withNote(
        <VirtuosoWrapper>
          <Search />
        </VirtuosoWrapper>,
      ),
    );

    const searchInput = getByLabelText("Search this flow");
    user.type(searchInput, "text");

    await waitFor(() => expect(getAllByRole("listitem")).toHaveLength(2));
  });

  test("clicking a note result navigates to the note edit route", async () => {
    const { user, getAllByRole, getByLabelText } = await setup(
      withNote(
        <VirtuosoWrapper>
          <Search />
        </VirtuosoWrapper>,
      ),
    );

    const searchInput = getByLabelText("Search this flow");
    user.type(searchInput, "Sample note text");

    await waitFor(() => expect(getAllByRole("listitem")).toHaveLength(1));

    const [noteItem] = getAllByRole("listitem");
    await user.click(within(noteItem).getByRole("button"));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "/app/$team/$flow/note/$id/edit",
        params: expect.objectContaining({ id: mockNote.positionId }),
      }),
    );
  });

  test("notes are excluded when 'Search only data fields' is checked", async () => {
    const { user, getAllByRole, getByRole, getByLabelText } = await setup(
      withNote(
        <VirtuosoWrapper>
          <Search />
        </VirtuosoWrapper>,
      ),
    );

    const checkbox = getByLabelText("Search only data fields");
    await user.click(checkbox);

    const searchInput = getByLabelText("Search this flow");
    user.type(searchInput, "Independent");

    await waitFor(() => expect(getByRole("list")).toBeEmptyDOMElement());
    expect(() => getAllByRole("listitem")).toThrow();
  });
});

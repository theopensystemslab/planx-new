import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { setup } from "testUtils";
import { SearchBox } from "../SearchBox";
import {
  mockFirstSearchTerm,
  MockRecords,
  mockRecords,
  mockSecondSearchTerm,
  mockSetRecords,
} from "./mocks";
import React from "react";
import { screen, waitFor } from "@testing-library/react";
import { axe } from "vitest-axe";
import { it } from "vitest";
import { checkForFirstSearchResults, waitForClearSearchIcon } from "./helpers";

const setupTestEnvironment = (searchKeys: string[]) =>
  setup(
    <DndProvider backend={HTML5Backend}>
      <SearchBox<MockRecords>
        records={mockRecords}
        setRecords={mockSetRecords}
        searchKey={searchKeys}
      />
    </DndProvider>,
  );

describe("the UI interactions of the SearchBox", () => {
  it("Renders a search box", () => {
    setupTestEnvironment(["slug"]);
    expect(screen.getByText("Search")).toBeVisible();
    expect(screen.getByRole("textbox")).toBeVisible();
  });
  it("shows a loading spinner when typing", async () => {
    const { user } = setupTestEnvironment(["slug"]);
    const searchBox = screen.getByRole("textbox");

    user.type(searchBox, mockFirstSearchTerm);
    await waitFor(() => {
      const searchSpinner = screen.queryByRole("button", {
        name: "is searching",
      });
      expect(searchSpinner).toBeVisible();
    });
  });

  it("shows a clear icon button when finished typing", async () => {
    const { user } = setupTestEnvironment(["slug"]);
    const searchBox = screen.getByRole("textbox");

    user.type(searchBox, mockFirstSearchTerm);
    await waitFor(() => {
      const clearIcon = screen.queryByRole("button", {
        name: "clear search",
      });
      expect(clearIcon).toBeVisible();
    });
  });

  it("removes the clear icon button when search term is cleared", async () => {
    const { user } = setupTestEnvironment(["slug"]);
    const searchBox = screen.getByRole("textbox");

    await user.type(searchBox, mockFirstSearchTerm);
    await checkForFirstSearchResults();

    await user.clear(searchBox);
    await waitFor(() => {
      const clearIcon = screen.queryByRole("button", {
        name: "clear search",
      });
      expect(clearIcon).not.toBeInTheDocument();
    });
  });

  it("does not contain accessibility violations", async () => {
    const { container } = setupTestEnvironment(["slug"]);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("the search functionality", () => {
  it("searchs records and returns the results when on a word is typed", async () => {
    const { user } = setupTestEnvironment(["slug"]);
    const searchBox = screen.getByRole("textbox");

    await user.type(searchBox, mockFirstSearchTerm);
    await checkForFirstSearchResults();

    await waitForClearSearchIcon(screen);

    expect(mockSetRecords).toHaveBeenLastCalledWith([
      {
        name: "Mock result one",
        slug: "mock-result-one",
      },
      {
        name: "Mock result two",
        slug: "mock-result-two",
      },
    ]);
  });
  it("sets the results back to records when a search term is deleted", async () => {
    const { user } = setupTestEnvironment(["slug"]);
    const searchBox = screen.getByRole("textbox");

    await user.type(searchBox, mockFirstSearchTerm);

    await waitForClearSearchIcon(screen);
    await checkForFirstSearchResults();

    await user.clear(searchBox);

    await waitFor(() => {
      const clearIcon = screen.queryByRole("button", {
        name: "clear search",
      });
      const searchingSpinner = screen.queryByRole("button", {
        name: "is searching",
      });
      expect(clearIcon).not.toBeInTheDocument();
      expect(searchingSpinner).not.toBeInTheDocument();
    });

    expect(mockSetRecords).toHaveBeenLastCalledWith(mockRecords);
  });

  it("refilters results when the search term is changed", async () => {
    const { user } = setupTestEnvironment(["slug"]);
    const searchBox = screen.getByRole("textbox");

    await user.type(searchBox, mockSecondSearchTerm);

    await waitForClearSearchIcon(screen);

    expect(mockSetRecords).toHaveBeenLastCalledWith([
      { name: "Unique name", slug: "unique-name" },
    ]);
  });
});

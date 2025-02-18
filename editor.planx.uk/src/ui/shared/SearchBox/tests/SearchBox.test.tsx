import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { setup } from "testUtils";
import { SearchBox } from "../SearchBox";
import { MockRecords, mockRecords, mockSetRecords } from "./mocks";
import React from "react";
import { screen, waitFor } from "@testing-library/react";
import { exp } from "mathjs";
import { axe } from "vitest-axe";

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

    user.type(searchBox, "search");
    await waitFor(() => {
      const searchSpinner = screen.queryByRole("button", {
        name: "currently searching",
      });
      expect(searchSpinner).toBeVisible();
    });
  });

  it("shows a clear icon button when finished typing", async () => {
    const { user } = setupTestEnvironment(["slug"]);
    const searchBox = screen.getByRole("textbox");

    user.type(searchBox, "search");
    await waitFor(() => {
      const clearSpinner = screen.queryByRole("button", {
        name: "clear search",
      });
      expect(clearSpinner).toBeVisible();
    });
  });

  it("does not contain accessibility violations", async () => {
    const { container } = setupTestEnvironment(["slug"]);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("the search functionality", () => {
  test.todo("records can be searched based on a word");
  test.todo("records are reset when a search term is cleared");

  test.todo("records are refiltered when the search term is changed");
});

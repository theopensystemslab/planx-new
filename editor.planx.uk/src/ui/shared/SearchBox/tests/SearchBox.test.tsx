import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { setup } from "testUtils";
import { SearchBox } from "../SearchBox";
import { MockRecords, mockRecords, mockSetRecords } from "./mocks";
import React from "react";

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
  test.todo("Render a search box");
  test.todo("A loading spinner appears when typing");

  test.todo("A clear icon button appears when finished typing");

  test.todo("does not contain accessibility violations");
});

describe("the search functionality", () => {
  test.todo("records can be searched based on a word");
  test.todo("records are reset when a search term is cleared");

  test.todo("records are refiltered when the search term is changed");
});

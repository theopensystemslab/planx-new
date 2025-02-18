import { describe, vi } from "vitest";
import Filters from "../Filter";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { setup } from "testUtils";
import {
  mockFilterOptions,
  mockRecords,
  MockRecordType,
  mockSetFilteredRecords,
} from "./mocks";
import React from "react";
import { screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { openFilterAccordion, selectCheckbox } from "./helpers";
import { capitalize, filter } from "lodash";

vi.mock("react-navi", () => ({
  useNavigation: () => ({
    navigate: vi.fn(),
  }),
  useCurrentRoute: () => ({
    url: {
      search: "",
    },
  }),
}));

const setupFilterEnvironment = () => {
  const filterEnvironment = setup(
    <DndProvider backend={HTML5Backend}>
      <Filters<MockRecordType>
        records={mockRecords}
        setFilteredRecords={mockSetFilteredRecords}
        filterOptions={mockFilterOptions}
      />
    </DndProvider>,
  );

  return filterEnvironment;
};

describe("the use and return of the Filter component", () => {
  it("renders a filter accordion", async () => {
    const { user } = setupFilterEnvironment();
    const filtersHeader = screen.getByText("Show filters");
    expect(filtersHeader).toBeVisible();
    await user.click(filtersHeader);
    const hideFiltersHeader = screen.getByText("Hide filters");

    expect(hideFiltersHeader).toBeVisible();
  });

  it("renders filter options", async () => {
    const { user } = setupFilterEnvironment();

    let filterStatusOption = screen.getByText("Online status");
    let filterNameOption = screen.getByText("Name");

    expect(filterStatusOption).not.toBeVisible();
    expect(filterNameOption).not.toBeVisible();

    await openFilterAccordion(screen, user)

    filterStatusOption = screen.getByText("Online status");
    filterNameOption = screen.getByText("Name");

    expect(filterStatusOption).toBeVisible();
    expect(filterNameOption).toBeVisible();
  });
  
  it("should not have any accessibility violations on initial render", async () => {
    const { container } = setupFilterEnvironment();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("adds or removes a chip when a filter is clicked", async () => {
    const {user} = setupFilterEnvironment()

    await openFilterAccordion(screen, user)

    const selectedCheckbox = screen.getByRole('checkbox', { name: "Online" })
    await user.click(selectedCheckbox)

    const filterOnlineChip = screen.getByRole('button', { name: "Online" })
    expect(filterOnlineChip).toBeVisible()

    await user.click(selectedCheckbox)
    expect(filterOnlineChip).not.toBeVisible()
  });

  test.todo("filters the records by the options which are checked");

  test.todo("sets the new records using the results of the filter");
});

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
import {
  deselectCheckbox,
  openFilterAccordion,
  selectCheckbox,
} from "./helpers";

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

    const showFiltersHeader = screen.getByText("Show filters");
    expect(showFiltersHeader).toBeVisible();

    await user.click(showFiltersHeader);
    const hideFiltersHeader = screen.getByText("Hide filters");

    expect(hideFiltersHeader).toBeVisible();
  });

  it("renders filter options", async () => {
    const { user } = setupFilterEnvironment();

    let filterStatusOption = screen.getByText("Online status");
    let filterNameOption = screen.getByText("Name");

    expect(filterStatusOption).not.toBeVisible();
    expect(filterNameOption).not.toBeVisible();

    await openFilterAccordion(screen, user);

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
    const { user } = setupFilterEnvironment();

    await openFilterAccordion(screen, user);

    await user.click(screen.getByRole("checkbox", { name: "Online" }));
    const filterOnlineChip = screen.getByRole("button", { name: "Online" });

    // when you select a filter, a clickable chip should appear for the option
    expect(filterOnlineChip).toBeVisible();

    await user.click(screen.getByRole("checkbox", { name: "Offline" }));
    const filterOfflineChip = screen.getByRole("button", { name: "Offline" });

    // when we change the filter value, the chip changes
    expect(filterOfflineChip).toBeVisible();
    expect(filterOnlineChip).not.toBeVisible();

    await user.click(screen.getByRole("checkbox", { name: "Offline" }));
    expect(filterOfflineChip).not.toBeVisible();
  });

  it("filters the records by a single option", async () => {
    const { user } = setupFilterEnvironment();

    await openFilterAccordion(screen, user);
    await selectCheckbox(screen, user, "Offline");

    expect(mockSetFilteredRecords).toHaveBeenCalledWith([
      {
        name: "offline-mock",
        status: "offline",
      },
    ]);
  });

  it("filters the records multiple options", async () => {
    const { user } = setupFilterEnvironment();

    await openFilterAccordion(screen, user);
    await selectCheckbox(screen, user, "Online");
    await selectCheckbox(screen, user, "Online-1");

    expect(mockSetFilteredRecords).toHaveBeenCalledWith([
      {
        name: "online-1",
        status: "online",
      },
    ]);
  });

  it("returns to mockRecords when all filters unchecked", async () => {
    const { user } = setupFilterEnvironment();

    await openFilterAccordion(screen, user);
    await selectCheckbox(screen, user, "Offline");

    expect(mockSetFilteredRecords).toHaveBeenCalledWith([
      {
        name: "offline-mock",
        status: "offline",
      },
    ]);

    // when we delect our filter, it should return to the array
    // we passed into the prop 'records'

    await deselectCheckbox(screen, user, "Offline");
    expect(mockSetFilteredRecords).toHaveBeenCalledWith(mockRecords);
  });
});

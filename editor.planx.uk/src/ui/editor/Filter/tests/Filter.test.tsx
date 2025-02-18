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
import { addFilter, expandFilterAccordion, removeFilter } from "./helpers";

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

const setupTestEnvironment = () => {
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

describe("the UI interactions of the Filter component", () => {
  it("toggles visibility when the filter accordion is clicked", async () => {
    const { user } = setupTestEnvironment();

    const showFiltersHeader = screen.getByText("Show filters");
    expect(showFiltersHeader).toBeVisible();

    await user.click(showFiltersHeader);
    expect(screen.getByText("Hide filters")).toBeVisible();
  });

  it("display the filter options when the accordion is open", async () => {
    const { user } = setupTestEnvironment();

    const filterStatusOption = screen.getByText("Online status");
    const filterNameOption = screen.getByText("Name");

    expect(filterStatusOption).not.toBeVisible();
    expect(filterNameOption).not.toBeVisible();

    await expandFilterAccordion(screen, user);

    expect(filterStatusOption).toBeVisible();
    expect(filterNameOption).toBeVisible();
  });

  it("should not have any accessibility violations on initial render", async () => {
    const { container } = setupTestEnvironment();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("Filter functionality", () => {
  it("manages filter chips correctly when selecting filters", async () => {
    const { user } = setupTestEnvironment();

    await expandFilterAccordion(screen, user);

    await user.click(screen.getByRole("checkbox", { name: "Online" }));
    const onlineChip = screen.getByRole("button", { name: "Online" });

    // when you select a filter, a clickable chip should appear for the option
    expect(onlineChip).toBeVisible();

    // change filter to it's other optionValue
    await user.click(screen.getByRole("checkbox", { name: "Offline" }));

    // check it has been selected
    const offlineChip = screen.getByRole("button", { name: "Offline" });
    expect(offlineChip).toBeVisible();

    // check previous filter has been deselected
    expect(
      screen.queryByRole("button", { name: "Online" }),
    ).not.toBeInTheDocument();

    // click selected filter
    await user.click(screen.getByRole("checkbox", { name: "Offline" }));

    // check filter is deselected
    expect(
      screen.queryByRole("button", { name: "Offline" }),
    ).not.toBeInTheDocument();
  });

  it("filters the records using a single option", async () => {
    const { user } = setupTestEnvironment();

    await expandFilterAccordion(screen, user);
    await addFilter(screen, user, "Offline");

    expect(mockSetFilteredRecords).toHaveBeenCalledWith([
      {
        name: "offline-mock",
        status: "offline",
      },
    ]);
  });

  it("filters the records using multiple options", async () => {
    const { user } = setupTestEnvironment();

    await expandFilterAccordion(screen, user);
    await addFilter(screen, user, "Online");
    await addFilter(screen, user, "Online-mock-2");

    expect(mockSetFilteredRecords).toHaveBeenCalledWith([
      {
        name: "online-mock-2",
        status: "online",
      },
    ]);
  });

  it("returns to mockRecords when all filters unchecked", async () => {
    const { user } = setupTestEnvironment();

    await expandFilterAccordion(screen, user);
    await addFilter(screen, user, "Offline");

    expect(mockSetFilteredRecords).toHaveBeenCalledWith([
      {
        name: "offline-mock",
        status: "offline",
      },
    ]);

    // when we remove our filter, it should return to the array we passed into the prop 'records'
    await removeFilter(screen, user, "Offline");
    expect(mockSetFilteredRecords).toHaveBeenCalledWith(mockRecords);
  });
});

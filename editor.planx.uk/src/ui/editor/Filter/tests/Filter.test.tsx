import { screen } from "@testing-library/react";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { setup } from "testUtils";
import { describe, vi } from "vitest";
import { axe } from "vitest-axe";

import Filters from "../Filter";
import { addFilter, removeFilter } from "./helpers";
import {
  mockFilterOptions,
  mockRecords,
  MockRecordType,
  mockSetFilteredRecords,
} from "./mocks";

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
  it("should not have any accessibility violations on initial render", async () => {
    const { container } = setupTestEnvironment();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("displays the filter options by default", () => {
    setupTestEnvironment();

    expect(screen.getByText("Online status")).toBeVisible();
    expect(screen.getByText("Name")).toBeVisible();
  });
});

describe("Filter functionality", () => {
  it("manages filter chips correctly when selecting filters", async () => {
    const { user } = setupTestEnvironment();

    expect(
      screen.queryByRole("button", { name: "Online" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: "Online" }));

    // when you select a filter, a clickable chip should appear for the option
    const onlineChip = screen.getByRole("button", { name: "Online" });
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

    await addFilter(user, "Offline");

    expect(mockSetFilteredRecords).toHaveBeenCalledWith([
      {
        name: "offline-mock",
        status: "offline",
      },
    ]);
  });

  it("filters the records using multiple options", async () => {
    const { user } = setupTestEnvironment();

    await addFilter(user, "Online");
    await addFilter(user, "Online-mock-2");

    expect(mockSetFilteredRecords).toHaveBeenCalledWith([
      {
        name: "online-mock-2",
        status: "online",
      },
    ]);
  });

  it("returns to mockRecords when all filters unchecked", async () => {
    const { user } = setupTestEnvironment();

    await addFilter(user, "Offline");

    expect(mockSetFilteredRecords).toHaveBeenCalledWith([
      {
        name: "offline-mock",
        status: "offline",
      },
    ]);

    // when we remove our filter, it should return to the array we passed into the prop 'records'
    await removeFilter(user, "Offline");
    expect(mockSetFilteredRecords).toHaveBeenCalledWith(mockRecords);
  });
});

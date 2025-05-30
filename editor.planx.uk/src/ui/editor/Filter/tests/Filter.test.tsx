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

    expect(screen.getByLabelText("Online status")).toBeVisible();
    expect(screen.getByLabelText("Name")).toBeVisible();
  });
});

describe("Filter functionality", () => {
  it("manages filter chips correctly when selecting and deselecting filters", async () => {
    const { user } = setupTestEnvironment();

    expect(
      screen.queryByRole("button", { name: "Online" }),
    ).not.toBeInTheDocument();

    // Open combobox and select "Online"
    await user.click(screen.getByRole("combobox", { name: "Online status" }));
    await user.click(screen.getByRole("option", { name: "Online" }));

    // Expect online chip to be visible
    const onlineChip = screen.getByRole("button", { name: "Online" });
    expect(onlineChip).toBeVisible();

    // Click the "Online" chip to remove it
    await user.click(onlineChip);

    // Verify "Online" chip is removed
    expect(
      screen.queryByRole("button", { name: "Online" }),
    ).not.toBeInTheDocument();

    // Open combobox and select "Offline"
    await user.click(screen.getByRole("combobox", { name: "Online status" }));
    await user.click(screen.getByRole("option", { name: "Offline" }));

    // Expect offline chip to be visible
    const offlineChip = screen.getByRole("button", { name: "Offline" });
    expect(offlineChip).toBeVisible();

    // Click the "Offline" chip to remove it
    await user.click(offlineChip);

    // Verify "Offline" chip is removed
    expect(
      screen.queryByRole("button", { name: "Offline" }),
    ).not.toBeInTheDocument();
  });

  it("filters the records using a single option", async () => {
    const { user } = setupTestEnvironment();

    await addFilter(user, "Online status", "Offline");

    expect(mockSetFilteredRecords).toHaveBeenCalledWith([
      {
        name: "offline-mock",
        status: "offline",
      },
    ]);
  });

  it("filters the records using multiple options", async () => {
    const { user } = setupTestEnvironment();

    await addFilter(user, "Online status", "Online");
    await addFilter(user, "Name", "Online-mock-2");

    expect(mockSetFilteredRecords).toHaveBeenCalledWith([
      {
        name: "online-mock-2",
        status: "online",
      },
    ]);
  });

  it("returns to mockRecords when all filters unchecked", async () => {
    const { user } = setupTestEnvironment();

    await addFilter(user, "Online status", "Offline");

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

import { screen } from "@testing-library/react";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { setup } from "testUtils";
import { describe, vi } from "vitest";
import { axe } from "vitest-axe";

import Filters from "../Filter";
import { mockFilterOptions, MockRecordType } from "./mocks";

// Create a stateful mock for URL search params
let mockSearchParams: Record<string, string | undefined> = {};

const mockNavigate = vi.fn(
  (options: {
    to: string;
    search?: (
      prev: Record<string, string | undefined>,
    ) => Record<string, string | undefined>;
    replace?: boolean;
  }) => {
    // Simulate updating URL params when navigate is called
    if (options.search && typeof options.search === "function") {
      const newParams = options.search(mockSearchParams);
      mockSearchParams = { ...mockSearchParams, ...newParams };
    }
  },
);

vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual("@tanstack/react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearch: () => mockSearchParams,
  };
});

const setupTestEnvironment = async (
  initialUrlParams: Record<string, string> = {},
) => {
  // Set initial URL params before rendering
  mockSearchParams = { ...initialUrlParams };

  const filterEnvironment = await setup(
    <DndProvider backend={HTML5Backend}>
      <Filters<MockRecordType> filterOptions={mockFilterOptions} />
    </DndProvider>,
  );

  return filterEnvironment;
};

beforeEach(() => {
  mockNavigate.mockClear();
  mockSearchParams = {};
});

const getSearchResult = (
  callIndex: number,
  prevParams: Record<string, string | undefined> = {},
) => {
  const navigateCall = mockNavigate.mock.calls[callIndex][0];
  expect(navigateCall.search).toBeDefined();
  return navigateCall.search!(prevParams);
};

describe("the UI interactions of the Filter component", () => {
  it("should not have any accessibility violations on initial render", async () => {
    const { container } = await setupTestEnvironment();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("displays the filter options by default", async () => {
    await setupTestEnvironment();

    expect(screen.getByLabelText("Online status")).toBeVisible();
    expect(screen.getByLabelText("Name")).toBeVisible();
  });
});

describe("Filter functionality", () => {
  it("displays filter chips when URL params are set", async () => {
    // Setup with initial URL param for "online" filter
    await setupTestEnvironment({ "online-status": "online" });

    // Expect online chip to be visible
    const onlineChip = screen.getByRole("button", { name: "Online" });
    expect(onlineChip).toBeVisible();
  });

  it("clicking a chip toggles the filter off", async () => {
    // Setup with initial URL param
    const { user } = await setupTestEnvironment({ "online-status": "offline" });

    // Chip should be visible initially
    const offlineChip = screen.getByRole("button", { name: "Offline" });
    expect(offlineChip).toBeVisible();

    // Click the chip to remove the filter
    await user.click(offlineChip);

    // Verify navigate was called to clear the filter (passing same value toggles it)
    expect(mockNavigate).toHaveBeenCalledWith({
      to: ".",
      search: expect.any(Function),
      replace: true,
    });

    // Verify the search function would set the value to undefined
    const result = getSearchResult(0, { "online-status": "offline" });
    expect(result["online-status"]).toBeUndefined();
  });

  it("selecting an option from dropdown applies the filter", async () => {
    const { user } = await setupTestEnvironment();

    // No chips initially
    expect(
      screen.queryByRole("button", { name: "Online" }),
    ).not.toBeInTheDocument();

    // Open combobox and select "Online"
    await user.click(screen.getByRole("combobox", { name: "Online status" }));
    await user.click(screen.getByRole("option", { name: "Online" }));

    // Verify navigate was called to set the filter
    expect(mockNavigate).toHaveBeenCalledWith({
      to: ".",
      search: expect.any(Function),
      replace: true,
    });

    // Verify the search function would set the correct value
    const result = getSearchResult(0);
    expect(result["online-status"]).toBe("online");
  });

  it("applying a single filter updates URL correctly", async () => {
    const { user } = await setupTestEnvironment();

    // Select "Offline" from dropdown
    await user.click(screen.getByRole("combobox", { name: "Online status" }));
    await user.click(screen.getByRole("option", { name: "Offline" }));

    // Verify navigate was called with correct params
    expect(mockNavigate).toHaveBeenCalledTimes(1);

    const result = getSearchResult(0);
    expect(result["online-status"]).toBe("offline");
  });

  it("applying multiple filters updates URL with multiple params", async () => {
    const { user } = await setupTestEnvironment();

    // Select first filter
    await user.click(screen.getByRole("combobox", { name: "Online status" }));
    await user.click(screen.getByRole("option", { name: "Online" }));

    // Select second filter
    await user.click(screen.getByRole("combobox", { name: "Name" }));
    await user.click(screen.getByRole("option", { name: "Online-mock-2" }));

    // Verify navigate was called twice (once for each filter)
    expect(mockNavigate).toHaveBeenCalledTimes(2);

    // Verify first call set online-status
    const firstResult = getSearchResult(0);
    expect(firstResult["online-status"]).toBe("online");

    // Verify second call set name filter
    const secondResult = getSearchResult(1, { "online-status": "online" });
    expect(secondResult["name"]).toBe("online-mock-2");
  });

  it("removing a filter clears it from URL params", async () => {
    // Start with a filter already applied
    const { user } = await setupTestEnvironment({ "online-status": "offline" });

    // Chip should be visible
    const offlineChip = screen.getByRole("button", { name: "Offline" });
    expect(offlineChip).toBeVisible();

    // Click chip to remove filter
    await user.click(offlineChip);

    // Verify navigate was called to clear the filter
    expect(mockNavigate).toHaveBeenCalledTimes(1);

    const result = getSearchResult(0, { "online-status": "offline" });
    expect(result["online-status"]).toBeUndefined();
  });
});

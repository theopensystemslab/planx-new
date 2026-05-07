import { mockTeams } from "ui/shared/DataTable/mockTeams";
import { describe, expect, it } from "vitest";

import { formatDate, getFlowNamesForFilter } from "./utils";

describe("getFlowNamesForFilter", () => {
  it("returns an empty array when given empty input", () => {
    expect(getFlowNamesForFilter([])).toEqual([]);
  });

  it("returns an empty array when teams have no liveFlows", () => {
    expect(
      getFlowNamesForFilter([
        { id: "1", name: "Test Team", referenceCode: "TT" } as any,
      ]),
    ).toEqual([]);
  });

  it("capitalises and trims flow names", () => {
    const result = getFlowNamesForFilter(mockTeams);
    expect(result).not.toContain("apply for prior approval   ");
    expect(result).toContain("Apply for prior approval");
  });

  it("deduplicates flow names across teams", () => {
    // Barking has "Apply for prior approval" and Doncaster has "apply for prior approval   "
    // After normalisation both become "Apply for prior approval" and should appear just once
    const result = getFlowNamesForFilter(mockTeams);
    const count = result.filter(
      (name) => name === "Apply for prior approval",
    ).length;
    expect(count).toBe(1);
  });

  it("returns results sorted alphabetically", () => {
    const result = getFlowNamesForFilter(mockTeams);
    expect(result).toEqual([...result].sort());
  });

  it("does not include null or undefined entries", () => {
    const result = getFlowNamesForFilter(mockTeams);
    expect(result.every((name) => name != null)).toBe(true);
  });
});

describe("formatDate", () => {
  it("formats a valid ISO timestamp as d/MM/yy", () => {
    expect(formatDate("2025-11-24T15:36:17Z")).toBe("24/11/25");
  });

  it("does not zero-pad single-digit days", () => {
    expect(formatDate("2024-01-01T00:00:00Z")).toBe("1/01/24");
  });
});

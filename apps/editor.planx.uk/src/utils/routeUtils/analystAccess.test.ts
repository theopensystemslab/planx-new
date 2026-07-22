import { describe, expect, it } from "vitest";

import { isAnalystOnly } from "./analystAccess";

describe("isAnalystOnly", () => {
  it("returns true for platform analysts", () => {
    expect(
      isAnalystOnly({
        id: 1,
        email: "analyst@example.com",
        firstName: "Ana",
        lastName: "Lyst",
        isAnalyst: true,
        isPlatformAdmin: false,
        teams: [],
        defaultTeamId: null,
      }),
    ).toBe(true);
  });

  it("returns false for platform admins who are also analysts", () => {
    expect(
      isAnalystOnly({
        id: 1,
        email: "admin@example.com",
        firstName: "Admin",
        lastName: "User",
        isAnalyst: true,
        isPlatformAdmin: true,
        teams: [],
        defaultTeamId: null,
      }),
    ).toBe(false);
  });

  it("returns false for other users", () => {
    expect(
      isAnalystOnly({
        id: 1,
        email: "editor@example.com",
        firstName: "Team",
        lastName: "Editor",
        isAnalyst: false,
        isPlatformAdmin: false,
        teams: [],
        defaultTeamId: null,
      }),
    ).toBe(false);
  });
});

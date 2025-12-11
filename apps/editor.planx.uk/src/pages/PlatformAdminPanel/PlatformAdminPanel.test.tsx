import { screen, within } from "@testing-library/react";
import { graphql, HttpResponse } from "msw";
import React from "react";
import server from "test/mockServer";
import { setup } from "testUtils";
import { mockTeams } from "ui/shared/DataTable/mockTeams";
import { it } from "vitest";

import { PlatformAdminPanel } from "./PlatformAdminPanel";

const handlers = [
  graphql.query("GetAdminPanelData", () =>
    HttpResponse.json({ data: { adminPanel: mockTeams } }),
  ),
];

beforeEach(() => {
  server.use(...handlers);
});

describe("Platform admin panel", () => {
  it("renders expected headers and rows without an error", async () => {
    await setup(<PlatformAdminPanel />);

    const headers = [
      "Team",
      "Reference code",
      "Live services",
      "Planning constraints",
      "Article 4s",
      "GOV.UK Pay",
      "GOV.UK Notify",
      "Send to email",
      "BOPS",
      "Power automate",
      "Subdomain",
      "Logo",
      "Favicon",
    ];

    for (const header of headers) {
      expect(await screen.findByText(header)).toBeVisible();
    }

    // test for a selection of row values
    expect(
      screen.getByRole("gridcell", { name: "Barking and Dagenham" }),
    ).toBeVisible();

    expect(screen.getByRole("gridcell", { name: "DON" })).toBeVisible();

    expect(
      screen.getAllByText("Apply for a lawful development certificate"),
    ).toHaveLength(2); // Two teams in the mock data have an LDC flow
  }, 10_000);

  it("renders a tick / cross for boolean values", async () => {
    const { container } = await setup(<PlatformAdminPanel />);

    // Wait for data to load
    await screen.findByText("Barking and Dagenham");

    // get all cells in the 'Planning Constraints' column
    const planningConstraintCells = container.querySelectorAll(
      '[data-field="planningDataEnabled"]',
    );

    const firstRow = planningConstraintCells[1]; // first non-header row

    expect(
      await within(firstRow as HTMLElement).findByTestId("CloseIcon"), // cross icon
    ).toBeVisible();

    const secondRow = planningConstraintCells[2];

    expect(
      within(secondRow as HTMLElement).getByTestId("DoneIcon"), // tick icon
    ).toBeVisible();
  });
});

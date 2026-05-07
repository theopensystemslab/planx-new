import { screen, within } from "@testing-library/react";
import { graphql, HttpResponse } from "msw";
import server from "test/mockServer";
import { setup } from "test/utils";
import { mockTeams } from "ui/shared/DataTable/mockTeams";

import { PlatformAdminPanel } from "./PlatformAdminPanel";

const handlers = [
  graphql.query("GetAdminPanelData", () =>
    HttpResponse.json({ data: { adminPanel: mockTeams } }),
  ),
];

beforeEach(() => {
  server.use(...handlers);
});

describe("rendering column headers", () => {
  it("renders all 15 expected column headers", async () => {
    await setup(<PlatformAdminPanel />);

    const headers = [
      "Team",
      "Reference code",
      "Live services",
      "First online at",
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
      "Trial account",
    ];

    for (const header of headers) {
      expect(await screen.findByText(header)).toBeVisible();
    }
  });
});

describe("rendering row data", () => {
  it("renders team names and reference codes from mock data", async () => {
    await setup(<PlatformAdminPanel />);

    expect(
      await screen.findByRole("gridcell", { name: "Barking and Dagenham" }),
    ).toBeVisible();

    expect(screen.getByRole("gridcell", { name: "DON" })).toBeVisible();
  });

  it("renders live services names for each team", async () => {
    await setup(<PlatformAdminPanel />);

    await screen.findByRole("gridcell", { name: "Barking and Dagenham" });

    // Newcastle and Tewkesbury both have an LDC flow
    expect(
      screen.getAllByText("Apply for a lawful development certificate"),
    ).toHaveLength(2);
  });
});

describe("rendering boolean columns", () => {
  it("renders a tick icon for truthy boolean values and a cross icon for falsy boolean values", async () => {
    const { container } = await setup(<PlatformAdminPanel />);

    await screen.findByText("Barking and Dagenham");

    const planningConstraintCells = container.querySelectorAll(
      '[data-field="planningDataEnabled"]',
    );

    // Barking (row 1): planningDataEnabled = false
    const firstRow = planningConstraintCells[1];
    expect(
      await within(firstRow as HTMLElement).findByTestId("CloseIcon"),
    ).toBeVisible();

    // Doncaster (row 2): planningDataEnabled = true
    const secondRow = planningConstraintCells[2];
    expect(
      within(secondRow as HTMLElement).getByTestId("DoneIcon"),
    ).toBeVisible();
  });
});

describe("GOV.UK Notify column", () => {
  it("renders a Configured (tick) icon when govnotifyPersonalisation has helpEmail", async () => {
    const { container } = await setup(<PlatformAdminPanel />);

    await screen.findByText("Barking and Dagenham");

    const govnotifyCells = container.querySelectorAll(
      '[data-field="govnotifyPersonalisation"]',
    );

    // Barking (row 1) has govnotifyPersonalisation.helpEmail set
    const barkingCell = govnotifyCells[1];
    expect(
      within(barkingCell as HTMLElement).getByTestId("DoneIcon"),
    ).toBeVisible();
  });

  it("renders a NotConfigured (cross) icon when govnotifyPersonalisation is absent", async () => {
    const { container } = await setup(<PlatformAdminPanel />);

    await screen.findByText("Barking and Dagenham");

    const govnotifyCells = container.querySelectorAll(
      '[data-field="govnotifyPersonalisation"]',
    );

    // Doncaster (row 2) has no govnotifyPersonalisation
    const doncasterCell = govnotifyCells[2];
    expect(
      within(doncasterCell as HTMLElement).getByTestId("CloseIcon"),
    ).toBeVisible();
  });
});

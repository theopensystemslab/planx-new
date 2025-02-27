import { act, screen, within } from "@testing-library/react";
import { FullStore, useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { setup } from "testUtils";
import { mockTeams } from "ui/shared/DataTable/mockTeams";
import { it } from "vitest";

import { PlatformAdminPanel } from "./PlatformAdminPanel";
import { internalTeamNames } from "./utils";

const { getState, setState } = useStore;

let initialState: FullStore;

describe("Platform admin panel", () => {
  beforeAll(() => (initialState = getState()));

  beforeEach(() => {
    getState().setAdminPanelData(mockTeams);
  });
  afterEach(() => {
    act(() => setState(initialState));
  });

  it("renders expected headers and rows without an error", () => {
    setup(<PlatformAdminPanel />);
    const headers = [
      "Team",
      "Reference code",
      "Live services",
      "Planning constraints",
      "Article 4s (API)",
      "GOV.UK Pay",
      "GOV.UK Notify",
      "Send to email",
      "BOPS",
      "Power automate",
      "Subdomain",
      "Logo",
      "Favicon",
    ];
    headers.map((header) => expect(screen.getByText(header)).toBeVisible());

    // test for a selection of row values
    expect(
      screen.getByRole("gridcell", { name: "Barking and Dagenham" }),
    ).toBeVisible();

    expect(screen.getByRole("gridcell", { name: "DON" })).toBeVisible();

    expect(
      screen.getAllByText("Apply for a lawful development certificate"),
    ).toHaveLength(2); // Two teams in the mock data have an LDC flow
  });

  it("does not show rows for internal teams", () => {
    setup(<PlatformAdminPanel />);

    internalTeamNames.map((internalTeam) =>
      expect(screen.queryByText(internalTeam)).not.toBeInTheDocument(),
    );
  });

  it("renders a tick / cross for boolean values", () => {
    const { container } = setup(<PlatformAdminPanel />);

    // get all cells in the 'Planning Constraints' column
    const planningContraintCells = container.querySelectorAll(
      '[data-field="planningDataEnabled"]',
    );

    const firstRow = planningContraintCells[1]; // first non-header row

    expect(
      within(firstRow as HTMLElement).getByTestId("CloseIcon"), // cross icon
    ).toBeVisible();

    const secondRow = planningContraintCells[2];

    expect(
      within(secondRow as HTMLElement).getByTestId("DoneIcon"), // tick icon
    ).toBeVisible();
  });
});

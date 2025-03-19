import { User } from "@opensystemslab/planx-core/types";
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

// Set up mock state with platformAdmin user so all Editor features are enabled
const mockUser: User = {
  id: 123,
  email: "b.baggins@shire.com",
  isPlatformAdmin: true,
  firstName: "Bilbo",
  lastName: "Baggins",
  teams: [],
};

describe("When the platform admin panel is rendered", () => {
  beforeAll(() => (initialState = getState()));

  beforeEach(() => {
    getState().setAdminPanelData(mockTeams);
  });

  afterEach(() => {
    act(() => setState(initialState));
  });

  it("shows the expected headers and rows without an error", () => {
    setup(<PlatformAdminPanel />);
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

  it("shows a tick / cross for boolean values", () => {
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

describe("When the user filters the live services column", () => {
  beforeAll(() => (initialState = getState()));

  beforeEach(() => {
    getState().setAdminPanelData(mockTeams);
  });

  afterEach(() => {
    act(() => setState(initialState));
  });

  it("shows only the teams that have that service", async () => {
    act(() => setState({ user: mockUser }));
    const { user } = setup(<PlatformAdminPanel />);

    const filterButton = screen.getByRole("button", { name: "Show filters" });
    await user.click(filterButton);

    // filter box becomes visible
    expect(screen.getByLabelText("Operator")).toBeVisible();

    // TODO rest of logic....
  });
});

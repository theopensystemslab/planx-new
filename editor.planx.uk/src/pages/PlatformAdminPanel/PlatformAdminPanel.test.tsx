import { act, screen, within } from "@testing-library/react";
import { FullStore, useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { setup } from "testUtils";
import { mockTeams } from "ui/shared/DataTable/mockTeams";
import { it, vi } from "vitest";

import { PlatformAdminPanel } from "./PlatformAdminPanel";
import { internalTeamNames } from "./utils";

const { getState, setState } = useStore;

let initialState: FullStore;

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

describe.only("When the user filters the live services column", () => {
  beforeAll(() => (initialState = getState()));

  beforeEach(() => {
    getState().setAdminPanelData(mockTeams);
  });
  afterEach(() => {
    act(() => setState(initialState));
  });

  it("shows only the teams that have that service", async () => {
    const { user } = setup(<PlatformAdminPanel />);
    const filterButton = screen.getByRole("button", { name: "Show filters" });

    await user.click(filterButton);

    // filter box becomes visible
    expect(screen.getByLabelText("Operator")).toBeVisible();

    // select 'Live services' to filter on
    const columnSelect = screen.getByRole("combobox", { name: "Columns" });

    await act(async () => {
      await user.click(columnSelect);
      // await user.click(screen.getByRole("listitem", { name: "Live services" }));
    });

    // const lists = screen.getAllByRole("option");

    // console.log("mare", lists);
    await act(async () => {
      // await user.click(columnSelect);
      await user.click(screen.getByRole("option", { name: "Live services" }));
    });

    // const liveServicesOption = await screen.findByRole("option", {
    //   name: "Live services",
    // });
    // await user.click(liveServicesOption);

    // await user.click(container.querySelectorAll('[data-value="liveFlows"]')[0]);
    // const selectedItem = await screen.findByRole("option", {
    //   selected: true,
    // });
    // expect(selectedItem).toHaveTextContent("Live services");

    // const multiSelectInput = screen.getByTestId("multi-select-input");
    // const autocompleteInput = within(multiSelectInput).getByRole("combobox");

    // await user.click(autocompleteInput);

    // await user.click(screen.getByTestId("flow-b"));

    // expect(autocompleteInput).toHaveValue("team - flow b");

    const valueInput = screen.getByLabelText(/option/i);
    await act(async () => {
      await user.type(valueInput, "Find out if you need planning permission");
      //   await user.keyboard("[ArrowDown]");
      //   await user.keyboard("[Enter]");
    });
    await act(async () => {
      await user.keyboard("[ArrowDown]");
      await user.keyboard("[Enter]");
    });

    //   await user.keyboard("[ArrowDown]");
    //   await user.keyboard("[Enter]");

    // await user.click(screen.getByRole("combobox", { name: "Option" }));
    // // await user.click(container.querySelectorAll('[data-option-index="2"]')[0]);
    // const bla = await screen.findByRole("option", {
    //   name: "Find out if you need planning permission",
    // });
    // await user.click(bla);

    // user.click(screen.getByRole("textbox", { name: "Value" }));

    // const filterLiveServices = screen.getByRole("textbox", { name: "Value" });
    // await user.type(filterLiveServices, "Find out if you need planning permission");
    // await user.keyboard('[ArrowDown]');
    // await user.keyboard('[Enter]');

    // await user.click(
    //   screen.getByRole("option", {
    //     name: "Find out if you need planning permission",
    //   })
    // );

    // user.click(container.querySelectorAll('[data-option-index="2"]')[0]);

    expect(screen.getAllByRole("row")).toHaveLength(4);

    // expect(
    //   screen.getByRole("gridcell", { name: "Barking and Dagenham" })
    // ).not.toBeVisible();
  }, 7000);
});

/* eslint-disable jest/expect-expect */
import { screen, within } from "@testing-library/react";

import { setupTeamMembersScreen } from "./helpers/setupTeamMembersScreen";

jest.mock("lib/featureFlags.ts", () => ({
  hasFeatureFlag: jest.fn().mockReturnValue(true),
}));

describe("when a user views the Team members screen with the ADD_NEW_EDITOR feature flag enabled", () => {
  beforeEach(async () => {
    await setupTeamMembersScreen();
  });
  it("shows the 'add new editor' button", async () => {
    const teamEditorsTable = screen.getByTestId("team-editors");
    await within(teamEditorsTable).findByText("Add a new editor");
  });
});

describe("when a user with the ADD_NEW_EDITOR feature flag enabled presses 'add a new editor'", () => {
  beforeEach(async () => {
    const user = await setupTeamMembersScreen();
    const teamEditorsTable = screen.getByTestId("team-editors");
    const addEditorButton = await within(teamEditorsTable).findByText(
      "Add a new editor"
    );
    user.click(addEditorButton);
  });
  it("opens the modal and displays the input fields", async () => {
    expect(await screen.findByTestId("modal-create-user-button")).toBeVisible();
    expect(await screen.findByLabelText("First name")).toBeVisible();
  });
});

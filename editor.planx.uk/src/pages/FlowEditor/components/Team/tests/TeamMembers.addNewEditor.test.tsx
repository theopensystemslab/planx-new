import { screen, waitFor, within } from "@testing-library/react";
import { FullStore, useStore } from "pages/FlowEditor/lib/store";
import { vi } from "vitest";

import { setupTeamMembersScreen } from "./helpers/setupTeamMembersScreen";
import { userEntersInput } from "./helpers/userEntersInput";

vi.mock("lib/featureFlags.ts", () => ({
  hasFeatureFlag: vi.fn().mockReturnValue(true),
}));

vi.mock(
  "pages/FlowEditor/components/Team/queries/createAndAddUserToTeam.tsx",
  () => ({
    createAndAddUserToTeam: vi.fn().mockResolvedValue({
      id: 1,
      __typename: "users",
    }),
  }),
);

let initialState: FullStore;

describe("when a user with the ADD_NEW_EDITOR feature flag enabled presses 'add a new editor'", () => {
  beforeEach(async () => {
    const user = await setupTeamMembersScreen();

    const teamEditorsTable = screen.getByTestId("team-editors");
    const addEditorButton = await within(teamEditorsTable).findByText(
      "Add a new editor",
    );
    user.click(addEditorButton);
  });

  it("opens the modal and displays the input fields", async () => {
    expect(await screen.findByTestId("modal-create-user-button")).toBeVisible();
    expect(await screen.findByLabelText("First name")).toBeVisible();
  });
});

describe("when a user fills in the 'add a new editor' form correctly", () => {
  afterAll(() => useStore.setState(initialState));
  beforeEach(async () => {
    const user = await setupTeamMembersScreen();
    const teamEditorsTable = screen.getByTestId("team-editors");
    const addEditorButton = await within(teamEditorsTable).findByText(
      "Add a new editor",
    );
    user.click(addEditorButton);
    const addNewEditorModal = await screen.findByTestId("modal-create-user");
    await userEntersInput("First name", "Mickey", addNewEditorModal);
    await userEntersInput("Last name", "Mouse", addNewEditorModal);
    await userEntersInput(
      "Email address",
      "mickeymouse@email.com",
      addNewEditorModal,
    );

    const createUserButton = await screen.findByTestId(
      "modal-create-user-button",
    );

    user.click(createUserButton);
  });

  it("adds the new user row to the Team Editors table", async () => {
    const membersTable = screen.getByTestId("members-table-add-editor");

    await waitFor(() => {
      expect(
        within(membersTable).getByText(/Mickey Mouse/),
      ).toBeInTheDocument();
    });
  });
});

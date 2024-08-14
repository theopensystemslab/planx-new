import { screen, waitFor, within } from "@testing-library/react";

import { setupTeamMembersScreen } from "./helpers/setupTeamMembersScreen";
import { userEntersInput } from "./helpers/userEntersInput";

jest.mock("lib/featureFlags.ts", () => ({
  hasFeatureFlag: jest.fn().mockReturnValue(true),
}));
jest.mock("pages/FlowEditor/lib/store/team.ts", () => ({
  teamStore: jest.fn().mockImplementation(() => ({
    fetchCurrentTeam: jest.fn().mockResolvedValue({
      team_id: 1,
      role: "teamEditor",
      user_id: 1,
      __typename: "team_members",
    }),
  })),
}));
jest.mock("pages/FlowEditor/components/Team/queries/createUser.tsx", () => ({
  createUser: jest.fn().mockResolvedValue({
    id: 1,
    email: "mickeymouse@email.com",
    first_name: "Mickey",
    last_name: "Mouse",
    is_platform_admin: false,
    __typename: "users",
  }),
}));
jest.mock("pages/FlowEditor/components/Team/queries/addUserToTeam.tsx", () => ({
  addUserToTeam: jest.fn().mockResolvedValue({
    team_id: 1,
    role: "teamEditor",
    user_id: 1,
    __typename: "team_members",
  }),
}));

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

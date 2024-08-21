import { screen, waitFor, within } from "@testing-library/react";
import { FullStore, useStore } from "pages/FlowEditor/lib/store";

import { exampleTeamMembersData } from "./exampleTeamMembersData";
import { setupTeamMembersScreen } from "./helpers/setupTeamMembersScreen";
import { userTriesToAddNewEditor } from "./helpers/userTriesToAddNewEditor";

jest.mock("lib/featureFlags.ts", () => ({
  hasFeatureFlag: jest.fn().mockReturnValue(true),
}));

jest.mock(
  "pages/FlowEditor/components/Team/queries/createAndAddUserToTeam.tsx",
  () => ({
    createAndAddUserToTeam: jest.fn().mockResolvedValue({
      id: 1,
      __typename: "users",
    }),
  }),
);

let initialState: FullStore;

describe("when a user with the ADD_NEW_EDITOR feature flag enabled presses 'add a new editor'", () => {
  beforeEach(async () => {
    useStore.setState({ teamMembers: exampleTeamMembersData });
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
    useStore.setState({ teamMembers: exampleTeamMembersData });
    const user = await setupTeamMembersScreen();
    await userTriesToAddNewEditor(user);
  });

  it("adds the new user row to the Team Editors table", async () => {
    const membersTable = screen.getByTestId("members-table-add-editor");

    await waitFor(() => {
      expect(
        within(membersTable).getByText(/Mickey Mouse/),
      ).toBeInTheDocument();
    });
  });

  it("shows a success message", async () => {
    expect(
      await screen.findByText(/Successfully added a user/),
    ).toBeInTheDocument();
  });
});

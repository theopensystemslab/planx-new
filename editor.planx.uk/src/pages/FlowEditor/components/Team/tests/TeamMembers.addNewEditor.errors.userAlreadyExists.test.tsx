import { screen, within } from "@testing-library/react";
import { FullStore, useStore } from "pages/FlowEditor/lib/store";
import { vi } from "vitest";

import { setupTeamMembersScreen } from "./helpers/setupTeamMembersScreen";
import { userTriesToAddNewEditor } from "./helpers/userTriesToAddNewEditor";
import { mockTeamMembersData } from "./mocks/mockTeamMembersData";
import { alreadyExistingUser, mockPlatformAdminUser } from "./mocks/mockUsers";

vi.mock(
  "pages/FlowEditor/components/Team/queries/createAndAddUserToTeam.tsx",
  () => ({
    createAndAddUserToTeam: vi.fn().mockRejectedValue({
      message:
        'Uniqueness violation. duplicate key value violates unique constraint "users_email_key"',
    }),
  }),
);
let initialState: FullStore;

describe("when a user fills in the 'add a new editor' form correctly but the user already exists", () => {
  afterAll(() => useStore.setState(initialState));
  beforeEach(async () => {
    useStore.setState({
      teamMembers: [...mockTeamMembersData, alreadyExistingUser],
      user: mockPlatformAdminUser,
    });

    const { user } = await setupTeamMembersScreen();
    await userTriesToAddNewEditor(user);
  });

  it("shows an appropriate error message", async () => {
    const addNewEditorModal = await screen.findByTestId("dialog-add-user");

    expect(
      await within(addNewEditorModal).findByText(/User already exists/),
    ).toBeInTheDocument();
  });
});

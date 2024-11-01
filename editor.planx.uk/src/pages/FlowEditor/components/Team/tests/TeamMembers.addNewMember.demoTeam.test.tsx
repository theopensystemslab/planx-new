import { waitFor, within } from "@testing-library/react";
import { useStore } from "pages/FlowEditor/lib/store";
import { vi } from "vitest";

import { DEMO_TEAM_ID } from "../components/UserUpsertModal";
import { setupTeamMembersScreen } from "./helpers/setupTeamMembersScreen";
import { userTriesToAddNewMember } from "./helpers/userTriesToAddNewMember";
import { mockTeamMembersData } from "./mocks/mockTeamMembersData";
import { mockPlatformAdminUser } from "./mocks/mockUsers";

const { setState, getState } = useStore;

vi.mock(
  "pages/FlowEditor/components/Team/queries/createAndAddUserToTeam.tsx",
  async () => ({
    createAndAddUserToTeam: vi.fn().mockResolvedValue({
      id: 1,
      __typename: "users",
    }),
  }),
);

describe("adding a new user to the Demo team", () => {
  beforeEach(async () => {
    setState({
      user: mockPlatformAdminUser,
      teamMembers: mockTeamMembersData,
      teamId: DEMO_TEAM_ID,
    });
  });

  it("assigns the `demoUser` role automatically", async () => {
    let currentUsers = getState().teamMembers;
    expect(currentUsers).toHaveLength(3);

    const { user, getByTestId } = await setupTeamMembersScreen();
    await userTriesToAddNewMember(user);

    const membersTable = getByTestId("members-table-add-member");

    await waitFor(() => {
      expect(
        within(membersTable).getByText(/Mickey Mouse/),
      ).toBeInTheDocument();
    });

    currentUsers = getState().teamMembers;
    expect(currentUsers).toHaveLength(4);

    // Role correctly assigned to user
    const newUser = getState().teamMembers[3];
    expect(newUser.role).toBe("demoUser");

    // Use role tag displayed in table
    expect(within(membersTable).getByText("Demo User")).toBeVisible();
  });
});

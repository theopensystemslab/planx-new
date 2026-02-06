import { screen, within } from "@testing-library/react";
import { useStore } from "pages/FlowEditor/lib/store";

import { TeamMember } from "../types";
import { setupTeamMembersScreen } from "./helpers/setupTeamMembersScreen";
import { mockPlatformAdminUser } from "./mocks/mockUsers";

const mockTeamMembersDataWithNoTeamEditors: TeamMember[] = [
  {
    firstName: "Donella",
    lastName: "Meadows",
    email: "donella@example.com",
    id: 1,
    role: "platformAdmin",
    defaultTeamId: null,
  },
];

describe("when a user views the 'Team members' screen but there are no existing team members listed", () => {
  beforeEach(async () => {
    useStore.setState({
      teamMembers: mockTeamMembersDataWithNoTeamEditors,
      user: mockPlatformAdminUser,
    });
    const { getByText } = await setupTeamMembersScreen();
    getByText("No members found");
  });

  it("shows the 'add a new member' button", async () => {
    const teamMembersTable = screen.getByTestId("team-members");
    expect(
      await within(teamMembersTable).findByText("Add a new member"),
    ).toBeVisible();
  });
});

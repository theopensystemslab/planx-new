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
  },
];

describe("when a user views the 'Team members' screen but there are no existing team editors listed", () => {
  beforeEach(async () => {
    useStore.setState({
      teamMembers: mockTeamMembersDataWithNoTeamEditors,
      user: mockPlatformAdminUser,
    });
    const { getByText } = await setupTeamMembersScreen();
    getByText("No members found");
  });

  it("shows the 'add a new editor' button", async () => {
    const teamEditorsTable = screen.getByTestId("team-editors");
    expect(
      await within(teamEditorsTable).findByText("Add a new editor"),
    ).toBeVisible();
  });
});

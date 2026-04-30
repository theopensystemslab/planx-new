import { screen, within } from "@testing-library/react";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import server from "test/mockServer";
import { setup } from "testUtils";

import { TeamMembers } from "../TeamMembers";
import { getUsersWithNoTeamEditorHandler } from "./mocks/handlers";
import { mockPlatformAdminUser } from "./mocks/users";

describe("when a user views the 'Team members' screen but there are no existing team members listed", () => {
  beforeEach(async () => {
    useStore.setState({
      user: mockPlatformAdminUser,
    });

    server.use(getUsersWithNoTeamEditorHandler());

    await setup(
      <DndProvider backend={HTML5Backend}>
        <TeamMembers />
      </DndProvider>,
    );

    screen.getByText("No members found");
  });

  it("shows the 'add a new member' button", async () => {
    const teamMembersTable = screen.getByTestId("team-members");
    expect(
      await within(teamMembersTable).findByText("Add a new member"),
    ).toBeVisible();
  });
});

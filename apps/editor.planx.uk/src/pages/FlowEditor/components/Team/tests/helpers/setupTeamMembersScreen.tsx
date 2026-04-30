import { screen } from "@testing-library/react";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import server from "test/mockServer";

import { setup } from "../../../../../../testUtils";
import { TeamMembers } from "../../TeamMembers";
import { getNoExistingUserHandler, getUsersHandler } from "../mocks/handlers";

export const setupTeamMembersScreen = async () => {
  server.use(getUsersHandler(), getNoExistingUserHandler());

  const setupResult = await setup(
    <DndProvider backend={HTML5Backend}>
      <TeamMembers />
    </DndProvider>,
  );
  await screen.findByTestId("team-members");
  return setupResult;
};

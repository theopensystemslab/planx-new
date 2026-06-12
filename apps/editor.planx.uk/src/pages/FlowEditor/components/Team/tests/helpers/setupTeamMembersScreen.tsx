import { screen } from "@testing-library/react";
import { graphql, HttpResponse } from "msw";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import server from "test/mockServer";

import { setup } from "../../../../../../test/utils";
import { TeamMembers } from "../../TeamMembers";
import { getNoExistingUserHandler, getUsersHandler } from "../mocks/handlers";
import { mockUsersData } from "../mocks/users";

export const setupTeamMembersScreenWithData = async (
  usersData = mockUsersData,
) => {
  server.use(
    graphql.query("GetUsersForTeam", () =>
      HttpResponse.json({
        data: { users: usersData },
      }),
    ),
    getNoExistingUserHandler(),
  );

  const setupResult = await setup(
    <DndProvider backend={HTML5Backend}>
      <TeamMembers />
    </DndProvider>,
  );
  await screen.findByTestId("team-members");
  return setupResult;
};

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

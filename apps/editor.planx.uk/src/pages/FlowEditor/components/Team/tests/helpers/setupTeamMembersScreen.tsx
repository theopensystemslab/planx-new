import { screen } from "@testing-library/react";
import { graphql, HttpResponse } from "msw";
import { useStore } from "pages/FlowEditor/lib/store";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import server from "test/mockServer";

import { setup } from "../../../../../../test/utils";
import { TeamMembers } from "../../TeamMembers";
import { getNoExistingUserHandler, getUsersHandler } from "../mocks/handlers";
import { mockUsersData } from "../mocks/users";

// TeamMembers reads the current user's role from the $team route
const getTeamRoute = () => ({
  teamSlug: useStore.getState().teamSlug || "test",
});

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
    undefined,
    getTeamRoute(),
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
    undefined,
    getTeamRoute(),
  );
  await screen.findByTestId("team-members");
  return setupResult;
};

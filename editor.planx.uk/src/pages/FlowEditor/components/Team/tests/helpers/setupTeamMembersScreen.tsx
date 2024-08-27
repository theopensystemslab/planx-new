import { screen } from "@testing-library/react";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { setup } from "../../../../../../testUtils";
import { TeamMembers } from "../../TeamMembers";

export const setupTeamMembersScreen = async () => {
  const setupResult = setup(
    <DndProvider backend={HTML5Backend}>
      <TeamMembers />
    </DndProvider>,
  );
  await screen.findByTestId("team-editors");
  return setupResult;
};

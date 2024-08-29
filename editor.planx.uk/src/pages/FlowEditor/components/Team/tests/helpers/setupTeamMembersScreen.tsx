import { screen } from "@testing-library/react";
import { ToastContextProvider } from "contexts/ToastContext";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { setup } from "../../../../../../testUtils";
import { TeamMembers } from "../../TeamMembers";

export const setupTeamMembersScreen = async () => {
  const { user } = setup(
    <DndProvider backend={HTML5Backend}>
      <ToastContextProvider>
        <TeamMembers />
      </ToastContextProvider>
    </DndProvider>,
  );
  await screen.findByText("Team editors");
  return user;
};

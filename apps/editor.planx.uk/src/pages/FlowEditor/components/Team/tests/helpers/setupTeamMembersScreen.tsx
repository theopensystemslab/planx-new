import { screen } from "@testing-library/react";
import { ToastContextProvider } from "contexts/ToastContext";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { setup } from "../../../../../../testUtils";
import { TeamMembers } from "../../TeamMembers";

const TeamMembersWrapper = () => {
  const teamMembers = useStore((state) => state.teamMembers || []);
  return <TeamMembers teamMembers={teamMembers} />;
};

export const setupTeamMembersScreen = async () => {
  const setupResult = setup(
    <DndProvider backend={HTML5Backend}>
      <ToastContextProvider>
        <TeamMembersWrapper />
      </ToastContextProvider>
    </DndProvider>,
  );
  await screen.findByTestId("team-members");
  return setupResult;
};

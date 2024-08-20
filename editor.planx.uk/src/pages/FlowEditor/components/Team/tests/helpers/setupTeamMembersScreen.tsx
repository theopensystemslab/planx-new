import { screen } from "@testing-library/react";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { setup } from "../../../../../../testUtils";
import { TeamMembers } from "../../TeamMembers";
import { exampleTeamMembersData } from "../exampleTeamMembersData";

export const setupTeamMembersScreen = async () => {
  useStore.setState({ teamMembers: exampleTeamMembersData });

  const { user } = setup(
    <DndProvider backend={HTML5Backend}>
      <TeamMembers />
    </DndProvider>,
  );
  await screen.findByText("Team editors");
  return user;
};

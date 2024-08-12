import { screen } from "@testing-library/react";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { setup } from "../../../../../../testUtils";
import { TeamMembers } from "../../TeamMembers";
import { exampleTeamMembersData } from "./../exampleTeamMembersData";

export async function setupTeamMembersScreen() {
  const { user } = setup(
    <DndProvider backend={HTML5Backend}>
      <TeamMembers teamMembersByRole={exampleTeamMembersData} />
    </DndProvider>
  );
  await screen.findByText("Team editors");
  return user;
}

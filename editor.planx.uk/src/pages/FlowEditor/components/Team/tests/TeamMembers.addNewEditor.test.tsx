/* eslint-disable jest/expect-expect */
import { screen } from "@testing-library/react";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { setup } from "../../../../../testUtils";
import { TeamMembers } from "../TeamMembers";
import { exampleTeamMembersData } from "./exampleTeamMembersData";

jest.mock("lib/featureFlags.ts", () => ({
  hasFeatureFlag: jest.fn().mockReturnValue(true),
}));

describe("when a user views the Team members screen with the ADD_NEW_EDITOR feature flag enabled", () => {
  beforeEach(async () => {
    setup(
      <DndProvider backend={HTML5Backend}>
        <TeamMembers teamMembersByRole={exampleTeamMembersData} />
      </DndProvider>,
    );
    await screen.findByText("Team editors");
  });
  it("shows the 'add new editor' button", async () => {
    await screen.findByText("Add a new editor");
  });
});

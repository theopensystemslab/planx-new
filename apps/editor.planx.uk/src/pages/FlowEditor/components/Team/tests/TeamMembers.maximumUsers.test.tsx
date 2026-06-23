import { screen } from "@testing-library/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { axe } from "vitest-axe";

import { setup } from "../../../../../test/utils";
import { MAX_USER_COUNT, MembersTable } from "../components/MembersTable";
import {
  mockTeamMembersAt19,
  mockTeamMembersAt20,
} from "../components/mockMembers";

describe("when the maximum number of active users exists for a team", () => {
  it("opens the maximum users modal when clicking 'Add a new member'", async () => {
    const { user } = await setup(
      <DndProvider backend={HTML5Backend}>
        <MembersTable
          members={mockTeamMembersAt20}
          showAddMemberButton={true}
          userRole="platformAdmin"
        />
      </DndProvider>,
    );

    const addMemberButton = screen.getByText("Add a new member");
    await user.click(addMemberButton);

    expect(await screen.findByTestId("dialog-maximum-users")).toBeVisible();
  });
});

// if the MAX_USER_COUNT constant changes, the mocks should be updated to include that number of members
describe(`when there are <${MAX_USER_COUNT} active users`, () => {
  it("shows the add user modal, as archived members are not included in active member count", async () => {
    const { user } = await setup(
      <DndProvider backend={HTML5Backend}>
        <MembersTable
          members={mockTeamMembersAt19}
          showAddMemberButton={true}
          userRole="platformAdmin"
        />
      </DndProvider>,
    );

    const addMemberButton = screen.getByText("Add a new member");
    await user.click(addMemberButton);

    expect(
      screen.queryByTestId("dialog-maximum-users"),
    ).not.toBeInTheDocument();
  });
});

describe("when the addNewMember modal is rendered", () => {
  it("should not have any accessibility issues", async () => {
    const { user, container } = await setup(
      <DndProvider backend={HTML5Backend}>
        <MembersTable
          members={mockTeamMembersAt20}
          showAddMemberButton={true}
          userRole="platformAdmin"
        />
      </DndProvider>,
    );

    const addMemberButton = screen.getByText("Add a new member");
    await user.click(addMemberButton);
    await screen.findByTestId("dialog-maximum-users");

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

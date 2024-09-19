import { screen, within } from "@testing-library/react";
import { exp } from "mathjs";
import { useStore } from "pages/FlowEditor/lib/store";
import { vi } from "vitest";

import { setupTeamMembersScreen } from "./helpers/setupTeamMembersScreen";
import { mockTeamMembersData } from "./mocks/mockTeamMembersData";
import { mockPlainUser, mockPlatformAdminUser } from "./mocks/mockUsers";

vi.mock("pages/FlowEditor/components/Team/queries/updateUser.tsx", () => ({
  updateTeamMember: vi.fn().mockResolvedValue({
    id: 1,
  }),
}));

describe("when a user presses 'remove' button", () => {
  beforeEach(async () => {
    useStore.setState({
      teamMembers: mockTeamMembersData,
      user: mockPlatformAdminUser,
      teamSlug: "planx",
    });

    const { user } = await setupTeamMembersScreen();

    const teamEditorsTable = screen.getByTestId("team-editors");
    const removeButton = await within(teamEditorsTable).findByTestId(
      "remove-button-0",
    );

    await user.click(removeButton);
    // Start each test with an open modal
  });

  it("the delete a user modal should appear", async () => {
    const deleteModal = screen.queryByTestId("modal-delete-user");
    expect(deleteModal).toBeInTheDocument();
  });

  it("should show a delete message and a button to delete the user", async () => {
    const deleteModal = screen.getByTestId("modal-delete-user");

    const deleteTitle = within(deleteModal).queryByText("Delete a user");

    expect(deleteTitle).toBeInTheDocument();

    const deleteMessage = within(deleteModal).queryByText(
      /Do you want to delete/,
    );
    expect(deleteMessage).toBeInTheDocument();

    const deleteButton = screen.queryByRole("button", {
      name: /Delete user/,
    });

    expect(deleteButton).toBeInTheDocument();
  });
});

describe("when a user clicks 'Delete user' button", () => {
  beforeEach(async () => {
    useStore.setState({
      teamMembers: mockTeamMembersData,
      user: mockPlatformAdminUser,
      teamSlug: "planx",
    });

    const { user } = await setupTeamMembersScreen();

    const teamEditorsTable = screen.getByTestId("team-editors");
    const removeButton = await within(teamEditorsTable).findByTestId(
      "remove-button-0",
    );

    await user.click(removeButton);
    // Start each test with an open modal

    const deleteButton = screen.getByRole("button", {
      name: /Delete user/,
    });

    await user.click(deleteButton);
  });
});

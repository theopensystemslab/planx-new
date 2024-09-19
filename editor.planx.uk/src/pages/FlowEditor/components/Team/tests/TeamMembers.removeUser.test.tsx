import { screen, waitFor, within } from "@testing-library/react";
import { useStore } from "pages/FlowEditor/lib/store";

import { setupTeamMembersScreen } from "./helpers/setupTeamMembersScreen";
import { mockTeamMembersData } from "./mocks/mockTeamMembersData";
import { mockPlatformAdminUser } from "./mocks/mockUsers";

describe("when a user presses 'remove' button", () => {
  beforeEach(async () => {
    useStore.setState({
      teamMembers: mockTeamMembersData,
      user: mockPlatformAdminUser,
      teamSlug: "planx",
    });
    const { user } = await setupTeamMembersScreen();

    const teamEditorsTable = screen.getByTestId("team-editors");
    const removeRowButton = await within(teamEditorsTable).findByTestId(
      "remove-button-0",
    );

    await user.click(removeRowButton);
    // Start each test with an open modal
  });

  it("the remove a user modal should appear", async () => {
    const removeModal = screen.queryByTestId("modal-remove-user");
    expect(removeModal).toBeInTheDocument();
  });

  it("should show an remove message and a button to remove the user", async () => {
    const removeModal = screen.getByTestId("modal-remove-user");

    const removeTitle = within(removeModal).queryByText("Remove a user");

    expect(removeTitle).toBeInTheDocument();

    const removeMessage = within(removeModal).queryByText(
      /Do you want to remove/,
    );
    expect(removeMessage).toBeInTheDocument();

    const removeButton = screen.queryByRole("button", {
      name: /Remove user/,
    });

    expect(removeButton).toBeInTheDocument();
  });
});

describe("when a user clicks 'Remove user' button", () => {
  beforeEach(async () => {
    useStore.setState({
      teamMembers: mockTeamMembersData,
      user: mockPlatformAdminUser,
      teamSlug: "planx",
    });

    const { user } = await setupTeamMembersScreen();

    const teamEditorsTable = screen.getByTestId("team-editors");
    const removeRowButton = await within(teamEditorsTable).findByTestId(
      "remove-button-0",
    );

    await user.click(removeRowButton);
    // Start each test with an open modal

    const removeButton = screen.getByRole("button", {
      name: /Remove user/,
    });

    await user.click(removeButton);
  });

  it("should close the modal", async () => {
    const teamEditorsTable = screen.getByTestId("team-editors");
    const removedUser = within(teamEditorsTable).queryByText("Donella");
    expect(removedUser).not.toBeInTheDocument();
    const removeModal = screen.queryByTestId("modal-remove-user");
    await waitFor(() => {
      expect(removeModal).not.toBeInTheDocument();
    });
  });
});

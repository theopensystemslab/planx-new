import { screen, waitFor, within } from "@testing-library/react";
import { useStore } from "pages/FlowEditor/lib/store";
import server from "test/mockServer";
import { axe } from "vitest-axe";

import { setupTeamMembersScreen } from "./helpers/setupTeamMembersScreen";
import { deleteUserHandler } from "./mocks/handlers";
import { mockPlainUser, mockPlatformAdminUser } from "./mocks/users";

describe("when a user presses 'remove' button", () => {
  let axeContainer: HTMLElement;
  beforeEach(async () => {
    useStore.setState({
      user: mockPlatformAdminUser,
    });
    const { user, container } = await setupTeamMembersScreen();

    const teamMembersTable = screen.getByTestId("team-members");
    const removeRowButton =
      await within(teamMembersTable).findByTestId("remove-button-3");
    axeContainer = container;
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

  it("should not have any accessibility issues", async () => {
    await screen.findByTestId("modal-remove-user");
    const results = await axe(axeContainer);
    expect(results).toHaveNoViolations();
  });
});

describe("when a user clicks 'Remove user' button", () => {
  beforeEach(async () => {
    useStore.setState({
      user: mockPlatformAdminUser,
    });
    const { user } = await setupTeamMembersScreen();

    server.use(deleteUserHandler());

    const teamMembersTable = screen.getByTestId("team-members");

    const removeRowButton =
      within(teamMembersTable).getByTestId("remove-button-3");

    await user.click(removeRowButton);

    const removeButton = screen.getByTestId("modal-remove-user-button");
    await user.click(removeButton);
  });

  it("should close the modal", async () => {
    const removeModal = screen.queryByTestId("modal-remove-user");

    await waitFor(() => {
      expect(removeModal).not.toBeInTheDocument();
    });
  });

  it("should move the user to Archived Members table", async () => {
    await waitFor(() => {
      const archiveTable = screen.getByTestId("archived-members");
      expect(within(archiveTable).getByText(/Bilbo/)).toBeInTheDocument();
    });
  });

  it("should display a success toast message", async () => {
    const successToast = screen.queryByText(
      /Successfully removed Bilbo Baggins/i,
    );
    expect(successToast).toBeInTheDocument();
  });
});

describe("when a user is not a platform admin", () => {
  beforeEach(async () => {
    useStore.setState({
      user: mockPlainUser,
    });

    await setupTeamMembersScreen();
  });

  it("does not show a remove button", async () => {
    const teamMembersTable = screen.getByTestId("team-members");
    const addEditorButton =
      within(teamMembersTable).queryByTestId("remove-button-0");

    expect(addEditorButton).not.toBeInTheDocument();
  });
});

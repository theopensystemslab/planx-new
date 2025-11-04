import { screen, waitFor, within } from "@testing-library/react";
import { useStore } from "pages/FlowEditor/lib/store";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import { setupTeamMembersScreen } from "./helpers/setupTeamMembersScreen";
import { mockTeamMembersData } from "./mocks/mockTeamMembersData";
import { mockPlainUser, mockPlatformAdminUser } from "./mocks/mockUsers";

const mockRemoveUser = vi.fn().mockResolvedValue(true);
vi.mock("@opensystemslab/planx-core", () => {
  return {
    CoreDomainClient: vi.fn().mockImplementation(() => ({
      user: {
        delete: () => mockRemoveUser(),
      },
    })),
  };
});

describe("when a user presses 'remove' button", () => {
  let axeContainer: HTMLElement;
  beforeEach(async () => {
    useStore.setState({
      teamMembers: mockTeamMembersData,
      user: mockPlatformAdminUser,
      teamSlug: "planx",
      teamId: 1,
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
      teamMembers: mockTeamMembersData,
      user: mockPlatformAdminUser,
      teamSlug: "planx",
      teamId: 1,
    });
    const { user } = await setupTeamMembersScreen();

    const teamMembersTable = screen.getByTestId("team-members");

    const removeRowButton =
      within(teamMembersTable).getByTestId("remove-button-3");

    await user.click(removeRowButton);

    const removeButton = screen.getByTestId("modal-remove-user-button");
    await user.click(removeButton);
  });

  it("should close the modal", async () => {
    expect(mockRemoveUser).toHaveBeenCalled();
    const removeModal = screen.queryByTestId("modal-remove-user");

    await waitFor(() => {
      expect(removeModal).not.toBeInTheDocument();
    });
  });

  it("should move the user to Archived Members table", async () => {
    const archiveTable = screen.getByTestId("archived-members");

    const archivedBill = within(archiveTable).queryByText(/Bilbo/);

    expect(archivedBill).toBeInTheDocument();
  });

  it("should display a success toast message", async () => {
    const successToast = screen.queryByText(
      /Successfully removed Bilbo Baggins/i,
    );
    expect(successToast).toBeInTheDocument();
  });
});

describe("'remove' button is hidden from Templates team", () => {
  beforeEach(async () => {
    useStore.setState({
      teamMembers: mockTeamMembersData,
      user: mockPlatformAdminUser,
      teamSlug: "templates",
      teamId: 2,
    });
  });

  it("hides the button on the Templates team", async () => {
    const { user: _user } = await setupTeamMembersScreen();
    const teamMembersTable = screen.getByTestId("team-members");
    const editButton =
      within(teamMembersTable).queryByTestId("remove-button-3");
    expect(editButton).not.toBeInTheDocument();
  });
});

describe("when a user is not a platform admin", () => {
  beforeEach(async () => {
    useStore.setState({
      teamMembers: mockTeamMembersData,
      user: mockPlainUser,
      team: "planx",
      teamId: 1,
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

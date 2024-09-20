import { screen, waitFor, within } from "@testing-library/react";
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

describe("when a user presses 'edit button'", () => {
  beforeEach(async () => {
    useStore.setState({
      teamMembers: mockTeamMembersData,
      user: mockPlatformAdminUser,
      teamSlug: "planx",
    });

    const { user } = await setupTeamMembersScreen();

    const teamEditorsTable = screen.getByTestId("team-editors");
    const addEditorButton = await within(teamEditorsTable).findByTestId(
      "edit-button-0",
    );

    user.click(addEditorButton);
    // Start each test with an open modal
  });

  it("opens the modal and displays the input fields with all inputs prepopulated", async () => {
    expect(await screen.findByTestId("modal-edit-user")).toBeVisible();
    const firstNameInput = await screen.findByLabelText("First name");
    const lastNameInput = await screen.findByLabelText("Last name");
    const emailInput = await screen.findByLabelText("Email address");
    // Sorted based on first letter of first name Bill > Donella in Mocks
    expect(firstNameInput).toHaveDisplayValue("Bilbo");
    expect(lastNameInput).toHaveDisplayValue("Baggins");
    expect(emailInput).toHaveDisplayValue("bil.bags@email.com");
  });
  it("disables the update user button", async () => {
    // find whole modal
    const modal = await screen.findByRole("dialog");
    expect(modal).toBeVisible();

    const updateUserButton = await within(modal).findByRole("button", {
      name: "Update user",
    });

    // disabled until form is 'dirty'
    expect(updateUserButton).toBeDisabled();
  });
});

describe("when a user deletes an input value", () => {
  beforeEach(async () => {
    useStore.setState({ teamMembers: mockTeamMembersData, teamSlug: "planx" });
  });
  it("displays an error message when clicking away", async () => {
    const { user } = await setupTeamMembersScreen();

    const teamEditorsTable = screen.getByTestId("team-editors");
    const addEditorButton = await within(teamEditorsTable).findByTestId(
      "edit-button-0",
    );
    await user.click(addEditorButton);

    const modal = await screen.findByRole("dialog");
    const firstNameInput = await screen.findByLabelText("First name");
    expect(firstNameInput).toHaveDisplayValue(mockTeamMembersData[2].firstName);

    await user.clear(firstNameInput);

    // initially no error
    const firstNameError = await screen.findByTestId(/error-message-firstName/);
    expect(firstNameError).toBeEmptyDOMElement();

    await user.click(modal);

    //error appears after clicking away
    expect(firstNameError).not.toBeEmptyDOMElement();

    const updateUserButton = await within(modal).findByRole("button", {
      name: "Update user",
    });

    expect(updateUserButton).toBeDisabled();
  });
});

describe("when a user updates a field correctly", () => {
  beforeEach(async () => {
    useStore.setState({ teamMembers: mockTeamMembersData, teamSlug: "planx" });
    const { user } = await setupTeamMembersScreen();

    const teamEditorsTable = screen.getByTestId("team-editors");
    const addEditorButton = await within(teamEditorsTable).findByTestId(
      "edit-button-0",
    );
    await user.click(addEditorButton);

    const modal = await screen.findByRole("dialog");
    const firstNameInput = await screen.findByLabelText("First name");

    await user.type(firstNameInput, "bo");

    await user.click(modal);
  });
  it("updates the field", async () => {
    const firstNameInput = await screen.findByLabelText("First name");
    expect(firstNameInput).toHaveDisplayValue(
      mockTeamMembersData[2].firstName + "bo",
    );
  });
  it("enables the update user button", async () => {
    const updateUserButton = await screen.findByRole("button", {
      name: "Update user",
    });
    expect(updateUserButton).not.toBeDisabled();
  });
});

describe("when a user correctly updates an Editor", () => {
  beforeEach(async () => {
    useStore.setState({ teamMembers: mockTeamMembersData, teamSlug: "planx" });
    const { user } = await setupTeamMembersScreen();

    const teamEditorsTable = screen.getByTestId("team-editors");
    const addEditorButton = await within(teamEditorsTable).findByTestId(
      "edit-button-0",
    );
    await user.click(addEditorButton);

    const firstNameInput = await screen.findByLabelText("First name");

    await user.type(firstNameInput, "bo");

    const updateUserButton = await screen.findByRole("button", {
      name: "Update user",
    });

    await user.click(updateUserButton);
  });
  it("updates the member table with new details", async () => {
    const membersTable = await screen.findByTestId("members-table-add-editor");
    await waitFor(() => {
      expect(within(membersTable).getByText(/Bilbobo/)).toBeInTheDocument();
    });
    expect(
      await screen.findByText(/Successfully updated a user/),
    ).toBeInTheDocument();
  });
  it("closes the modal", async () => {
    await waitFor(() => {
      expect(screen.queryByTestId("modal-edit-user")).not.toBeInTheDocument();
    });
  });
  it("shows a success message", async () => {
    expect(
      await screen.findByText(/Successfully updated a user/),
    ).toBeInTheDocument();
  });
});

describe("'edit' button is hidden from Templates team", () => {
  beforeEach(async () => {
    useStore.setState({
      teamMembers: mockTeamMembersData,
      user: mockPlatformAdminUser,
      teamSlug: "templates",
    });
  });

  it("hides the button on the Templates team", async () => {
    const { user: _user } = await setupTeamMembersScreen();
    const teamEditorsTable = screen.getByTestId("team-editors");
    const editButton = within(teamEditorsTable).queryByTestId("edit-button-0");
    expect(editButton).not.toBeInTheDocument();
  });
});

describe("when a user is not a platform admin", () => {
  beforeEach(async () => {
    useStore.setState({
      teamMembers: mockTeamMembersData,
      user: mockPlainUser,
      team: "planx",
    });

    await setupTeamMembersScreen();
  });

  it("does not show an edit button", async () => {
    const teamEditorsTable = screen.getByTestId("team-editors");
    const addEditorButton =
      within(teamEditorsTable).queryByTestId("edit-button-0");

    expect(addEditorButton).not.toBeInTheDocument();
  });
});

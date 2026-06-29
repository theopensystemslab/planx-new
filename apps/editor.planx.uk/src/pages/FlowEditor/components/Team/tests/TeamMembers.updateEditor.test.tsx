import { screen, waitFor, within } from "@testing-library/react";
import { useStore } from "pages/FlowEditor/lib/store";
import server from "test/mockServer";

import { setupTeamMembersScreen } from "./helpers/setupTeamMembersScreen";
import {
  updateUserAsTeamAdminHandler,
  updateUserOnlyHandler,
} from "./mocks/handlers";
import { mockPlatformAdminUser, mockUsersData } from "./mocks/users";

describe("when a user presses 'edit button'", () => {
  beforeEach(async () => {
    useStore.setState({
      user: mockPlatformAdminUser,
    });

    const { user } = await setupTeamMembersScreen();

    const teamMembersTable = screen.getByTestId("team-members");
    const addMemberButton =
      await within(teamMembersTable).findByTestId("edit-button-3");

    user.click(addMemberButton);
    // Start each test with an open modal
  });

  it("opens the modal and displays the input fields with all inputs prepopulated", async () => {
    expect(await screen.findByTestId("modal-edit-user")).toBeVisible();
    const firstNameInput = await screen.findByLabelText("First name");
    const lastNameInput = await screen.findByLabelText("Last name");
    const emailInput = await screen.findByLabelText("Email address");
    const roleDropdown = await screen.findByRole("combobox");

    // Sorted based on first letter of first name Bill > Donella in Mocks
    expect(firstNameInput).toHaveDisplayValue("Bilbo");
    expect(lastNameInput).toHaveDisplayValue("Baggins");
    expect(emailInput).toHaveDisplayValue("bil.bags@email.com");
    expect(roleDropdown).toHaveTextContent("Team editor");
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

describe("when a user updates a field correctly", () => {
  beforeEach(async () => {
    useStore.setState({ teamSlug: "test" });
    const { user } = await setupTeamMembersScreen();

    const teamMembersTable = screen.getByTestId("team-members");
    const addMemberButton =
      await within(teamMembersTable).findByTestId("edit-button-3");
    await user.click(addMemberButton);

    const modal = await screen.findByRole("dialog");
    const firstNameInput = await screen.findByLabelText("First name");

    await user.type(firstNameInput, "bo");

    await user.click(modal);
  });

  it("updates the field", async () => {
    const firstNameInput = await screen.findByLabelText("First name");
    expect(firstNameInput).toHaveDisplayValue(
      mockUsersData[2].firstName + "bo",
    );
  });

  it("enables the update user button", async () => {
    const updateUserButton = await screen.findByRole("button", {
      name: "Update user",
    });
    expect(updateUserButton).toBeEnabled();
  });
});

describe("when a user correctly updates an Editor's user details only", () => {
  beforeEach(async () => {
    useStore.setState({ teamSlug: "test" });

    server.use(updateUserOnlyHandler());

    const { user } = await setupTeamMembersScreen();

    const teamMembersTable = screen.getByTestId("team-members");
    const addMemberButton =
      await within(teamMembersTable).findByTestId("edit-button-3");
    await user.click(addMemberButton);

    const firstNameInput = await screen.findByLabelText("First name");

    await user.type(firstNameInput, "bo");

    const updateUserButton = await screen.findByRole("button", {
      name: "Update user",
    });

    await user.click(updateUserButton);
  });

  it("updates the member table with new details", async () => {
    const membersTable = await screen.findByTestId("members-table-add-member");
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

describe("when a user correctly makes a teamEditor a teamAdmin", () => {
  beforeEach(async () => {
    useStore.setState({
      user: mockPlatformAdminUser,
      teamSlug: "test",
      teamId: 2,
    });

    server.use(updateUserAsTeamAdminHandler());

    const { user } = await setupTeamMembersScreen();

    const teamMembersTable = screen.getByTestId("team-members");
    const editMemberButton =
      await within(teamMembersTable).findByTestId("edit-button-3");
    await user.click(editMemberButton);

    const roleDropdown = await screen.findByRole("combobox");
    await user.click(roleDropdown);

    const teamAdminOption = await screen.findByTestId("teamAdmin-option");
    await user.click(teamAdminOption);

    const updateUserButton = await screen.findByRole("button", {
      name: "Update user",
    });

    await user.click(updateUserButton);
  });

  it("updates the member table with new details", async () => {
    const membersTable = await screen.findByTestId("members-table-add-member");
    await waitFor(() => {
      expect(within(membersTable).getByText(/Team admin/)).toBeInTheDocument();
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
      user: mockPlatformAdminUser,
      teamSlug: "templates",
    });
  });

  it("hides the button on the Templates team", async () => {
    await setupTeamMembersScreen();
    const teamMembersTable = screen.getByTestId("team-members");
    const editButton = within(teamMembersTable).queryByTestId("edit-button-0");
    expect(editButton).not.toBeInTheDocument();
  });
});

describe("when editing a platform admin user", () => {
  beforeEach(async () => {
    useStore.setState({
      user: mockPlatformAdminUser,
    });

    const { user } = await setupTeamMembersScreen();

    const adminToggle = screen.getByTestId("platform-admins-toggle");
    await user.click(adminToggle);

    const editButton = await screen.findByTestId("edit-button-4");

    await user.click(editButton);
  });

  it("does not show the Team Admin switch when editing platform admins", async () => {
    expect(await screen.findByTestId("modal-edit-user")).toBeVisible();

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });
});

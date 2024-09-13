import { screen, within } from "@testing-library/react";
import { exp } from "mathjs";
import { useStore } from "pages/FlowEditor/lib/store";
import { vi } from "vitest";

import { setupTeamMembersScreen } from "./helpers/setupTeamMembersScreen";
import { userEntersInput } from "./helpers/userEntersInput";
import { mockTeamMembersData } from "./mocks/mockTeamMembersData";

describe("when a user presses 'edit button'", () => {
  beforeEach(async () => {
    useStore.setState({ teamMembers: mockTeamMembersData });
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
    expect(firstNameInput).toHaveDisplayValue(mockTeamMembersData[1].firstName);
    expect(lastNameInput).toHaveDisplayValue(mockTeamMembersData[1].lastName);
    expect(emailInput).toHaveDisplayValue(mockTeamMembersData[1].email);
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

describe("when a user deletes one input value", () => {
  beforeEach(async () => {
    useStore.setState({ teamMembers: mockTeamMembersData });
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

    await user.clear(firstNameInput);

    const firstNameError = await screen.findByTestId(/error-message-firstName/);
    expect(firstNameError).toBeEmptyDOMElement();

    await user.click(modal);

    expect(firstNameError).not.toBeEmptyDOMElement();

    const updateUserButton = await within(modal).findByRole("button", {
      name: "Update user",
    });

    expect(updateUserButton).toBeDisabled();
  });
});

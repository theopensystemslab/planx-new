import { screen, within } from "@testing-library/react";
// eslint-disable-next-line no-restricted-imports
import type { UserEvent } from "@testing-library/user-event";

import { userEntersInput } from "./userEntersInput";

export const userTriesToAddNewTeamAdmin = async (user: UserEvent) => {
  const teamMembersTable = screen.getByTestId("team-members");
  const addMemberButton =
    await within(teamMembersTable).findByText("Add a new member");
  await user.click(addMemberButton);

  const addNewEditorModal = await screen.findByTestId("modal-create-user");

  await userEntersInput(
    "Email address",
    "minniemouse@email.com",
    addNewEditorModal,
    user,
  );
  const continueButton = await screen.findByTestId("modal-create-user-button");
  await user.click(continueButton);

  await userEntersInput("First name", "Minnie", addNewEditorModal, user);
  await userEntersInput("Last name", "Mouse", addNewEditorModal, user);
  const roleDropdown = await within(addNewEditorModal).findByRole("combobox");
  await user.click(roleDropdown);
  const teamAdminOption = await screen.findByTestId("teamAdmin-option");
  await user.click(teamAdminOption);

  const createUserButton = await screen.findByTestId(
    "modal-create-user-button",
  );
  await user.click(createUserButton);
};

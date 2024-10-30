import { screen, within } from "@testing-library/react";
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";

import { userEntersInput } from "./userEntersInput";

export const userTriesToAddNewMember = async (user: UserEvent) => {
  const teamMembersTable = screen.getByTestId("team-members");
  const addMemberButton = await within(teamMembersTable).findByText(
    "Add a new member",
  );
  user.click(addMemberButton);
  const addNewEditorModal = await screen.findByTestId("modal-create-user");
  await userEntersInput("First name", "Mickey", addNewEditorModal, user);
  await userEntersInput("Last name", "Mouse", addNewEditorModal, user);
  await userEntersInput(
    "Email address",
    "mickeymouse@email.com",
    addNewEditorModal,
    user,
  );

  const createUserButton = await screen.findByTestId(
    "modal-create-user-button",
  );

  user.click(createUserButton);
};

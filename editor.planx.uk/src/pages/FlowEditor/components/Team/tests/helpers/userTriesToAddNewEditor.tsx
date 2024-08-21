import { screen, within } from "@testing-library/react";
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";

import { userEntersInput } from "./userEntersInput";

export const userTriesToAddNewEditor = async (user: UserEvent) => {
  const teamEditorsTable = screen.getByTestId("team-editors");
  const addEditorButton = await within(teamEditorsTable).findByText(
    "Add a new editor",
  );
  user.click(addEditorButton);
  const addNewEditorModal = await screen.findByTestId("modal-create-user");
  await userEntersInput("First name", "Mickey", addNewEditorModal);
  await userEntersInput("Last name", "Mouse", addNewEditorModal);
  await userEntersInput(
    "Email address",
    "mickeymouse@email.com",
    addNewEditorModal,
  );

  const createUserButton = await screen.findByTestId(
    "modal-create-user-button",
  );

  user.click(createUserButton);
};

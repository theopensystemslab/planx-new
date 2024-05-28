import { screen } from "@testing-library/react";
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";

export const typeUsingLabel = async (
  user: UserEvent,
  label: string,
  text: string,
) => await user.type(screen.getByLabelText(label), text);

export const fillInFieldsUsingLabel = async (
  user: UserEvent,
  ob: Record<string, string>,
) => {
  for (const [label, text] of Object.entries(ob)) {
    await typeUsingLabel(user, label, text);
  }
};

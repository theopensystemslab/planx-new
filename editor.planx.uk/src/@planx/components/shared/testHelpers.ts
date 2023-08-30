import { screen } from "@testing-library/react";
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";

export const typeUsingPlaceholder = async (
  user: UserEvent,
  placeholder: string,
  text: string,
) => await user.type(screen.getByPlaceholderText(placeholder), text);

export const fillInFieldsUsingPlaceholder = async (
  user: UserEvent,
  ob: Record<string, string>,
) => {
  for (const [placeholder, text] of Object.entries(ob)) {
    await typeUsingPlaceholder(user, placeholder, text);
  }
};

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

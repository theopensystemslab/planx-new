import { within } from "@testing-library/react";
// eslint-disable-next-line no-restricted-imports
import type { UserEvent } from "@testing-library/user-event";

export const userEntersInput = async (
  labelText: string,
  inputString: string,
  container: HTMLElement,
  user: UserEvent,
) => {
  const inputField = await within(container).findByLabelText(labelText);

  await user.type(inputField, inputString);
};

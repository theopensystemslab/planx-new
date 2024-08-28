import { within } from "@testing-library/react";
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";

export const userEntersInput = async (
  labelText: string,
  inputString: string,
  container: HTMLElement,
  user: UserEvent,
) => {
  const inputField = await within(container).findByLabelText(labelText);

  await user.type(inputField, inputString);
};

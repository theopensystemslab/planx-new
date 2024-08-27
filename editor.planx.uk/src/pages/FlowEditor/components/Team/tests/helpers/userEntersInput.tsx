import { fireEvent, within } from "@testing-library/react";

export const userEntersInput = async (
  labelText: string,
  inputString: string,
  container: HTMLElement,
) => {
  const inputField = await within(container).findByLabelText(labelText);

  fireEvent.change(inputField, {
    target: { value: inputString },
  });
};

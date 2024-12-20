import { screen } from "@testing-library/react";
// eslint-disable-next-line no-restricted-imports
import userEvent, {
  PointerEventsCheckLevel,
} from "@testing-library/user-event";

// Disabling pointerEventsCheck here allows us to bypass a false negative thrown by react-testing-library
// Tests fail to click the text elements when using ChecklistLayout.Images due to the pointerEvents: "none" style applied to textLabelWrapper, but the element can be clicked in all tested browsers

export const pressContinue = async () => {
  await userEvent.click(screen.getByTestId("continue-button"), {
    pointerEventsCheck: PointerEventsCheckLevel.Never,
  });
};

export const pressOption = async (optionText: string) => {
  await userEvent.click(screen.getByText(optionText), {
    pointerEventsCheck: PointerEventsCheckLevel.Never,
  });
};

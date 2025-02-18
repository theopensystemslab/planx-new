import { Screen } from "@testing-library/react";
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";
import { expect } from "vitest";

export const openFilterAccordion = async (screen: Screen, user: UserEvent) => {
  const showAccordionTitle = screen.getByText("Show filters");
  await user.click(showAccordionTitle);

  const hideAccordionTitle = screen.getByText("Hide filters");
  expect(hideAccordionTitle).toBeVisible();
};
export const closeFilterAccordion = async (screen: Screen, user: UserEvent) => {
  const hideAccordionTitle = screen.getByText("Hide filters");
  await user.click(hideAccordionTitle);

  const showAccordionTitle = screen.getByText("Show filters");
  expect(showAccordionTitle).toBeVisible();
};

export const selectCheckbox = async (
  screen: Screen,
  user: UserEvent,
  name: string,
) => {
  const checkbox = screen.getByRole("checkbox", { name: name });
  await user.click(checkbox);
  const filterChip = screen.getByRole("button", { name: name });
  expect(filterChip).toBeVisible();
};

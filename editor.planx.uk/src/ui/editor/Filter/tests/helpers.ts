import { Screen } from "@testing-library/react";
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";
import { expect } from "vitest";

export const expandFilterAccordion = async (screen: Screen, user: UserEvent) => {
  const showAccordionTitle = screen.getByText("Show filters");
  await user.click(showAccordionTitle);

  const hideAccordionTitle = screen.getByText("Hide filters");
  expect(hideAccordionTitle).toBeVisible();
};

export const addFilter = async (
  screen: Screen,
  user: UserEvent,
  name: string,
) => {
  const checkbox = screen.getByRole("checkbox", { name: name });
  await user.click(checkbox);
  const filterChip = screen.getByRole("button", { name: name });
  expect(filterChip).toBeVisible();
};

export const removeFilter = async (
  screen: Screen,
  user: UserEvent,
  name: string,
) => {
  const checkbox = screen.getByRole("checkbox", { name: name });
  await user.click(checkbox);
  const filterChip = screen.queryByRole("button", { name: name });
  expect(filterChip).not.toBeInTheDocument();
};

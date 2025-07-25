import { screen } from "@testing-library/react";
// eslint-disable-next-line no-restricted-imports
import type { UserEvent } from "@testing-library/user-event";
import { expect } from "vitest";

export const addFilter = async (
  user: UserEvent,
  selectLabel: string,
  optionLabel: string,
) => {
  const combobox = screen.getByRole("combobox", { name: selectLabel });
  await user.click(combobox);

  const option = screen.getByRole("option", { name: optionLabel });
  await user.click(option);

  const filterChip = screen.getByRole("button", { name: optionLabel });
  expect(filterChip).toBeVisible();
};

export const removeFilter = async (user: UserEvent, optionLabel: string) => {
  const filterChip = screen.getByRole("button", { name: optionLabel });
  await user.click(filterChip);
  expect(filterChip).not.toBeInTheDocument();
};

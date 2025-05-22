import { screen } from "@testing-library/react";
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";
import { expect } from "vitest";

export const addFilter = async (user: UserEvent, name: string) => {
  const combobox = screen.getByRole("combobox", { name: "Online status" });
  await user.click(combobox);
  const filterChip = screen.getByRole("button", { name });
  expect(filterChip).toBeVisible();
};

export const removeFilter = async (user: UserEvent, name: string) => {
  const filterChip = screen.getByRole("button", { name });
  await user.click(filterChip);
  expect(filterChip).not.toBeInTheDocument();
};

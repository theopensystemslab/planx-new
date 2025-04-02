import { screen } from "@testing-library/react";
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";
import { expect } from "vitest";

export const addFilter = async (user: UserEvent, name: string) => {
  const checkbox = screen.getByRole("checkbox", { name: name });
  await user.click(checkbox);
  const filterChip = screen.getByRole("button", { name: name });
  expect(filterChip).toBeVisible();
};

export const removeFilter = async (user: UserEvent, name: string) => {
  const checkbox = screen.getByRole("checkbox", { name: name });
  await user.click(checkbox);
  const filterChip = screen.queryByRole("button", { name: name });
  expect(filterChip).not.toBeInTheDocument();
};

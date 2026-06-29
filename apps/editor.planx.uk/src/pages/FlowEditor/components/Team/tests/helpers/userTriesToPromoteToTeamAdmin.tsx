import { screen, within } from "@testing-library/react";
// eslint-disable-next-line no-restricted-imports
import type { UserEvent } from "@testing-library/user-event";

export const userTriesToPromoteToTeamAdmin = async (user: UserEvent) => {
  const teamMembersTable = screen.getByTestId("team-members");
  const editButton =
    await within(teamMembersTable).findByTestId("edit-button-3");
  await user.click(editButton);

  const roleDropdown = await screen.findByRole("combobox");
  expect(roleDropdown).toHaveTextContent("Team editor");
  await user.click(roleDropdown);
  const teamAdminOption = await screen.findByTestId("teamAdmin-option");
  await user.click(teamAdminOption);

  const updateUserButton = await screen.findByRole("button", {
    name: "Update user",
  });
  await user.click(updateUserButton);
};

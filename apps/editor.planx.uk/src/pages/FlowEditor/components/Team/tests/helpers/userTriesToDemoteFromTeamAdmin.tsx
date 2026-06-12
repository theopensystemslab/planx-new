import { screen, within } from "@testing-library/react";
// eslint-disable-next-line no-restricted-imports
import type { UserEvent } from "@testing-library/user-event";

export const userTriesToDemoteFromTeamAdmin = async (user: UserEvent) => {
  const teamMembersTable = screen.getByTestId("team-members");

  const editButton =
    await within(teamMembersTable).findByTestId("edit-button-3");
  await user.click(editButton);

  const teamAdminSwitch = await screen.findByLabelText("Team Admin");
  expect(teamAdminSwitch).toBeChecked();

  await user.click(teamAdminSwitch);
  expect(teamAdminSwitch).not.toBeChecked();

  const updateUserButton = await screen.findByRole("button", {
    name: "Update user",
  });
  await user.click(updateUserButton);
};

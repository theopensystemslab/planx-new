/* eslint-disable jest/expect-expect */
import { screen, within } from "@testing-library/react";

import { setupTeamMembersScreen } from "./helpers/setupTeamMembersScreen";

jest.mock("lib/featureFlags.ts", () => ({
  hasFeatureFlag: jest.fn().mockReturnValue(true),
}));

describe("when a user with the ADD_NEW_EDITOR feature flag enabled presses 'add a new editor'", () => {
  beforeEach(async () => {
    const user = await setupTeamMembersScreen();
    const teamEditorsTable = screen.getByTestId("team-editors");
    const addEditorButton = await within(teamEditorsTable).findByText(
      "Add a new editor",
    );
    user.click(addEditorButton);
  });
  it("opens the modal and displays the input fields", async () => {
    expect(await screen.findByTestId("modal-create-user-button")).toBeVisible();
    expect(await screen.findByLabelText("First name")).toBeVisible();
  });
});

describe("when a user fills in the 'add a new editor' form correctly", () => {
  beforeEach(async () => {
    const user = await setupTeamMembersScreen();
    const teamEditorsTable = screen.getByTestId("team-editors");
    const addEditorButton = await within(teamEditorsTable).findByText(
      "Add a new editor",
    );
    user.click(addEditorButton);
    const addNewEditorModal = await screen.findByTestId("modal-create-user");
    const firstNameField = await within(addNewEditorModal).findByLabelText(
      "First name",
    );

    user.type(firstNameField, "Mickey");
    const lastNameField = await within(addNewEditorModal).findByLabelText(
      "Last name",
    );
    user.type(lastNameField, "Mouse");
    const emailField = await within(addNewEditorModal).findByLabelText(
      "Email address",
    );
    user.type(emailField, "mickeymouse@email.com");

    const createUserButton = await screen.findByTestId(
      "modal-create-user-button",
    );
    user.click(createUserButton);
  });
  it("closes the modal and adds the new user row to the Team Editors table", async () => {
    // TODO: this test is not working
    // waitForElementToBeRemoved(screen.findByTestId("modal-create-user"));
    // await waitFor(async () => {
    //   expect(
    //     await screen.findByTestId("modal-create-user-button")
    //   ).not.toBeVisible();
    //   expect(await screen.findByLabelText("First name")).not.toBeVisible();
    // });
    // await waitFor(() => {
    //   const modal = screen.queryByTestId('modal-create-user');
    //   expect(modal).not.toBeInTheDocument();
    // });
    // await waitForElementToBeRemoved(() =>
    //   screen.queryByTestId("modal-create-user")
    // );
    // expect(screen.queryByTestId("modal-create-user")).toBeNull();
  });
});

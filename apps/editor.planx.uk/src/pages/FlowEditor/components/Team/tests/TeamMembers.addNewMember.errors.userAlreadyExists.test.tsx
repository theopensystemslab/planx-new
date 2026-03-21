import { screen, within } from "@testing-library/react";
import { useStore } from "pages/FlowEditor/lib/store";
import server from "test/mockServer";

import { setupTeamMembersScreen } from "./helpers/setupTeamMembersScreen";
import { userTriesToAddNewMember } from "./helpers/userTriesToAddNewMember";
import { createUserAlreadyExistsHandler } from "./mocks/handlers";
import { mockPlatformAdminUser } from "./mocks/users";

describe("when a user fills in the 'add a new member' form correctly but the user already exists", () => {
  beforeEach(async () => {
    server.use(createUserAlreadyExistsHandler());

    useStore.setState({
      user: mockPlatformAdminUser,
    });

    const { user } = await setupTeamMembersScreen();
    await userTriesToAddNewMember(user);
  });

  it("shows an appropriate error message", async () => {
    const addNewEditorModal = await screen.findByTestId("dialog-add-user");
    expect(
      await within(addNewEditorModal).findByText(/User already exists/),
    ).toBeInTheDocument();
  });
});

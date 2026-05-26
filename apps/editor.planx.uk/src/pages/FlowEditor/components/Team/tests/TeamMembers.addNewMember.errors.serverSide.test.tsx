import { screen } from "@testing-library/react";
import { useStore } from "pages/FlowEditor/lib/store";
import server from "test/mockServer";

import { setupTeamMembersScreen } from "./helpers/setupTeamMembersScreen";
import { userTriesToAddNewTeamEditor } from "./helpers/userTriesToAddNewTeamEditor";
import { failToAddUserHandler } from "./mocks/handlers";
import { mockPlatformAdminUser } from "./mocks/users";

describe("when a user fills in the 'add a new member' form correctly but there is a server-side error", () => {
  beforeEach(async () => {
    useStore.setState({
      user: mockPlatformAdminUser,
    });

    server.use(failToAddUserHandler());

    const { user } = await setupTeamMembersScreen();
    await userTriesToAddNewTeamEditor(user);
  });

  it("shows an appropriate error message", async () => {
    expect(
      await screen.findByText(/Failed to add new user, please try again/),
    ).toBeInTheDocument();
  });
});

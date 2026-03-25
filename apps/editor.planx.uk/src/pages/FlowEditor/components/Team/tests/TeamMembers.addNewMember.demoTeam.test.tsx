import { screen, waitFor } from "@testing-library/react";
import { useStore } from "pages/FlowEditor/lib/store";
import server from "test/mockServer";

import { DEMO_TEAM_ID } from "../types";
import { setupTeamMembersScreen } from "./helpers/setupTeamMembersScreen";
import { userTriesToAddNewMember } from "./helpers/userTriesToAddNewMember";
import { addDemoUserHandler } from "./mocks/handlers";
import { mockPlatformAdminUser } from "./mocks/users";

describe("adding a new user to the Demo team", () => {
  beforeEach(async () => {
    useStore.setState({
      user: mockPlatformAdminUser,
      teamId: DEMO_TEAM_ID,
    });

    server.use(addDemoUserHandler());
  });

  it("assigns the `demoUser` role automatically", async () => {
    const { user } = await setupTeamMembersScreen();

    let memberRows = await screen.findAllByTestId("member-row");
    expect(memberRows).toHaveLength(3);

    await userTriesToAddNewMember(user);

    await waitFor(() => {
      expect(screen.getByText(/Mickey Mouse/)).toBeInTheDocument();
    });

    memberRows = screen.getAllByTestId("member-row");
    expect(memberRows).toHaveLength(4);

    expect(screen.getByText("Demo User")).toBeVisible();
  });
});

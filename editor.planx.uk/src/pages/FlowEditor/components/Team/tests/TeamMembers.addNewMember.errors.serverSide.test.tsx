import { screen } from "@testing-library/react";
import { FullStore, useStore } from "pages/FlowEditor/lib/store";
import { vi } from "vitest";

import { setupTeamMembersScreen } from "./helpers/setupTeamMembersScreen";
import { userTriesToAddNewMember } from "./helpers/userTriesToAddNewMember";
import { mockTeamMembersData } from "./mocks/mockTeamMembersData";
import { alreadyExistingUser, mockPlatformAdminUser } from "./mocks/mockUsers";

let initialState: FullStore;
vi.mock(
  "pages/FlowEditor/components/Team/queries/createAndAddUserToTeam.tsx",
  () => ({
    createAndAddUserToTeam: vi.fn().mockRejectedValue({
      message: "Unable to create user",
    }),
  }),
);

describe("when a user fills in the 'add a new member' form correctly but there is a server-side error", () => {
  beforeAll(() => (initialState = useStore.getState()));
  afterAll(() => useStore.setState(initialState));
  beforeEach(async () => {
    useStore.setState({
      teamMembers: [...mockTeamMembersData, alreadyExistingUser],
      user: mockPlatformAdminUser,
    });

    const { user } = await setupTeamMembersScreen();
    await userTriesToAddNewMember(user);
  });

  it("shows an appropriate error message", async () => {
    expect(
      await screen.findByText(/Failed to add new user, please try again/),
    ).toBeInTheDocument();
  });
});

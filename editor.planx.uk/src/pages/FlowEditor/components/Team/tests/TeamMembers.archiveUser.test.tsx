import { screen, within } from "@testing-library/react";
import { useStore } from "pages/FlowEditor/lib/store";
import { vi } from "vitest";

import { setupTeamMembersScreen } from "./helpers/setupTeamMembersScreen";
import { mockTeamMembersData } from "./mocks/mockTeamMembersData";
import { mockPlatformAdminUser } from "./mocks/mockUsers";

vi.mock("pages/FlowEditor/components/Team/queries/updateUser.tsx", () => ({
  updateTeamMember: vi.fn().mockResolvedValue({
    id: 1,
  }),
}));

describe("when a user presses 'archive' button", () => {
  beforeEach(async () => {
    useStore.setState({
      teamMembers: mockTeamMembersData,
      user: mockPlatformAdminUser,
      teamSlug: "planx",
    });

    const { user } = await setupTeamMembersScreen();

    const teamEditorsTable = screen.getByTestId("team-editors");
    const archiveRowButton = await within(teamEditorsTable).findByTestId(
      "archive-button-0",
    );

    await user.click(archiveRowButton);
    // Start each test with an open modal
  });

  it("the archive a user modal should appear", async () => {
    const archiveModal = screen.queryByTestId("modal-archive-user");
    expect(archiveModal).toBeInTheDocument();
  });

  it("should show an archive message and a button to archive the user", async () => {
    const archiveModal = screen.getByTestId("modal-archive-user");

    const archiveTitle = within(archiveModal).queryByText("Archive a user");

    expect(archiveTitle).toBeInTheDocument();

    const archiveMessage = within(archiveModal).queryByText(
      /Do you want to archive/,
    );
    expect(archiveMessage).toBeInTheDocument();

    const archiveButton = screen.queryByRole("button", {
      name: /Archive user/,
    });

    expect(archiveButton).toBeInTheDocument();
  });
});

describe("when a user clicks 'Archive user' button", () => {
  beforeEach(async () => {
    useStore.setState({
      teamMembers: mockTeamMembersData,
      user: mockPlatformAdminUser,
      teamSlug: "planx",
    });

    const { user } = await setupTeamMembersScreen();

    const teamEditorsTable = screen.getByTestId("team-editors");
    const archiveRowButton = await within(teamEditorsTable).findByTestId(
      "archive-button-0",
    );

    await user.click(archiveRowButton);
    // Start each test with an open modal

    const archiveButton = screen.getByRole("button", {
      name: /Archive user/,
    });

    await user.click(archiveButton);
  });
});

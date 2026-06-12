import { screen, waitFor, within } from "@testing-library/react";
import { FullStore, useStore } from "pages/FlowEditor/lib/store";
import server from "test/mockServer";

import {
  setupTeamMembersScreen,
  setupTeamMembersScreenWithData,
} from "./helpers/setupTeamMembersScreen";
import { userTriesToAddNewTeamAdmin } from "./helpers/userTriesToAddNewTeamAdmin";
import { userTriesToDemoteFromTeamAdmin } from "./helpers/userTriesToDemoteFromTeamAdmin";
import { userTriesToPromoteToTeamAdmin } from "./helpers/userTriesToPromoteToTeamAdmin";
import {
  createTeamAdminHandler,
  updateUserAsTeamAdminHandler,
  updateUserAsTeamEditorHandler,
} from "./mocks/handlers";
import {
  mockPlainUser,
  mockPlatformAdminUser,
  mockTeamAdminUser,
  mockUsersWithTeamAdmin,
} from "./mocks/users";

let initialState: FullStore;

describe("Role-based permissions", () => {
  beforeAll(() => (initialState = useStore.getState()));
  afterAll(() => useStore.setState(initialState));

  describe("when user is a platformAdmin", () => {
    beforeEach(() => {
      useStore.setState({
        user: mockPlatformAdminUser,
        teamId: 2,
      });
    });

    describe("adding new members", () => {
      it("can add a new teamAdmin", async () => {
        server.use(createTeamAdminHandler());

        const { user } = await setupTeamMembersScreen();

        await userTriesToAddNewTeamAdmin(user);

        const membersTable = screen.getByTestId("members-table-add-member");
        await waitFor(() => {
          expect(
            within(membersTable).getByText(/Minnie Mouse/),
          ).toBeInTheDocument();
          expect(
            within(membersTable).getByText(/Team admin/),
          ).toBeInTheDocument();
        });
      });
    });

    describe("editing existing members", () => {
      it("can promote a teamEditor to teamAdmin", async () => {
        server.use(updateUserAsTeamAdminHandler());

        const { user } = await setupTeamMembersScreen();

        await userTriesToPromoteToTeamAdmin(user);

        const membersTable = await screen.findByTestId(
          "members-table-add-member",
        );
        await waitFor(() => {
          expect(
            within(membersTable).getByText(/Team admin/),
          ).toBeInTheDocument();
        });
      });

      it("can demote a teamAdmin to teamEditor", async () => {
        server.use(updateUserAsTeamEditorHandler());

        const { user } = await setupTeamMembersScreenWithData(
          mockUsersWithTeamAdmin,
        );
        await userTriesToDemoteFromTeamAdmin(user);

        const membersTable = await screen.findByTestId(
          "members-table-add-member",
        );
        await waitFor(() => {
          expect(
            within(membersTable).getByText(/Team editor/),
          ).toBeInTheDocument();
        });
      });
    });
  });

  describe("when user is a teamAdmin", () => {
    beforeEach(() => {
      useStore.setState({
        user: mockTeamAdminUser,
        teamSlug: "test",
        teamId: 2,
      });
    });

    describe("adding new members", () => {
      it("can add a new teamAdmin", async () => {
        server.use(createTeamAdminHandler());

        const { user } = await setupTeamMembersScreen();
        await userTriesToAddNewTeamAdmin(user);

        const membersTable = screen.getByTestId("members-table-add-member");
        await waitFor(() => {
          expect(
            within(membersTable).getByText(/Minnie Mouse/),
          ).toBeInTheDocument();
          expect(
            within(membersTable).getByText(/Team admin/),
          ).toBeInTheDocument();
        });
      });
    });

    describe("editing existing members", () => {
      it("can promote a teamEditor to teamAdmin", async () => {
        server.use(updateUserAsTeamAdminHandler());

        const { user } = await setupTeamMembersScreen();

        await userTriesToPromoteToTeamAdmin(user);

        const membersTable = await screen.findByTestId(
          "members-table-add-member",
        );
        await waitFor(() => {
          expect(
            within(membersTable).getByText(/Team admin/),
          ).toBeInTheDocument();
        });
      });

      it("can demote a teamAdmin to teamEditor", async () => {
        server.use(updateUserAsTeamEditorHandler());

        const { user } = await setupTeamMembersScreenWithData(
          mockUsersWithTeamAdmin,
        );
        await userTriesToDemoteFromTeamAdmin(user);

        const membersTable = await screen.findByTestId(
          "members-table-add-member",
        );
        await waitFor(() => {
          expect(
            within(membersTable).getByText(/Team editor/),
          ).toBeInTheDocument();
        });
      });
    });
  });

  describe("when user is a teamEditor", () => {
    beforeEach(() => {
      useStore.setState({
        user: mockPlainUser,
        teamSlug: "test",
      });
    });

    describe("adding new members", () => {
      it("does not show add, edit or remove user buttons", async () => {
        await setupTeamMembersScreen();

        const teamMembersTable = screen.getByTestId("team-members");
        const addMemberButton =
          within(teamMembersTable).queryByText("Add a new member");
        expect(addMemberButton).not.toBeInTheDocument();

        const editMemberButton = within(teamMembersTable).queryByText("Edit");
        expect(editMemberButton).not.toBeInTheDocument();

        const removeMemberButton =
          within(teamMembersTable).queryByText("Remove");
        expect(removeMemberButton).not.toBeInTheDocument();
      });
    });
  });
});

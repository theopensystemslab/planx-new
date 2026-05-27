import { screen, waitFor, within } from "@testing-library/react";
import { FullStore, useStore } from "pages/FlowEditor/lib/store";
import server from "test/mockServer";

import { setupTeamMembersScreen } from "./helpers/setupTeamMembersScreen";
import { userEntersInput } from "./helpers/userEntersInput";
// import { userTriesToAddNewTeamAdmin } from "./helpers/userTriesToAddNewTeamAdmin";
import { createUserHandler, updateUserHandler } from "./mocks/handlers";
import {
  mockPlainUser,
  mockPlatformAdminUser,
  mockTeamAdminUser,
} from "./mocks/users";

let initialState: FullStore;

describe("Role-based permissions", () => {
  beforeAll(() => (initialState = useStore.getState()));
  afterAll(() => useStore.setState(initialState));

  describe("when user is a platformAdmin", () => {
    beforeEach(() => {
      useStore.setState({
        user: mockPlatformAdminUser,
      });
    });

    describe("adding new members", () => {
      it("can add a new teamAdmin", async () => {
        server.use(createUserHandler());

        const { user } = await setupTeamMembersScreen();

        const teamMembersTable = screen.getByTestId("team-members");
        const addMemberButton =
          await within(teamMembersTable).findByText("Add a new member");
        await user.click(addMemberButton);

        const modal = await screen.findByTestId("modal-create-user");
        await userEntersInput(
          "Email address",
          "minniemouse@email.com",
          modal,
          user,
        );

        const continueButton = await screen.findByTestId(
          "modal-create-user-button",
        );
        await user.click(continueButton);

        await userEntersInput("First name", "Minnie", modal, user);
        await userEntersInput("Last name", "Mouse", modal, user);

        const teamAdminSwitch =
          await within(modal).findByLabelText("Team Admin");
        await user.click(teamAdminSwitch);

        const createUserButton = await screen.findByTestId(
          "modal-create-user-button",
        );
        await user.click(createUserButton);

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
      it("shows the Team Admin switch in the edit member modal", async () => {
        const { user } = await setupTeamMembersScreen();

        const teamMembersTable = screen.getByTestId("team-members");
        const editButton =
          await within(teamMembersTable).findByTestId("edit-button-3");
        await user.click(editButton);

        const modal = await screen.findByTestId("modal-edit-user");
        const teamAdminSwitch =
          await within(modal).findByLabelText("Team Admin");

        expect(teamAdminSwitch).toBeInTheDocument();
      });

      it("can promote a teamEditor to teamAdmin", async () => {
        server.use(updateUserHandler());

        const { user } = await setupTeamMembersScreen();

        const teamMembersTable = screen.getByTestId("team-members");
        const editButton =
          await within(teamMembersTable).findByTestId("edit-button-3");
        await user.click(editButton);

        const teamAdminSwitch = await screen.findByLabelText("Team Admin");
        expect(teamAdminSwitch).not.toBeChecked();

        await user.click(teamAdminSwitch);
        expect(teamAdminSwitch).toBeChecked();

        const updateUserButton = await screen.findByRole("button", {
          name: "Update user",
        });
        await user.click(updateUserButton);

        const membersTable = await screen.findByTestId(
          "members-table-add-member",
        );
        await waitFor(() => {
          expect(
            within(membersTable).getByText(/Team admin/),
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
      });
    });

    describe("adding new members", () => {
      it.todo(
        "can add a new teamAdmin",
        //   , async () => {
        //   server.use(createUserHandler());

        //   const { user } = await setupTeamMembersScreen();
        //   await userTriesToAddNewTeamAdmin(user);

        //   const membersTable = screen.getByTestId("members-table-add-member");
        //   await waitFor(() => {
        //     expect(
        //       within(membersTable).getByText(/Minnie Mouse/),
        //     ).toBeInTheDocument();
        //     expect(
        //       within(membersTable).getByText(/Team admin/),
        //     ).toBeInTheDocument();
        //   });
        // });
      );
    });

    describe("editing existing members", () => {
      it.todo(
        "can make a teamEditor an teamAdmin",
        //   , async () => {
        //   server.use(updateUserHandler());

        //   const { user } = await setupTeamMembersScreen();

        //   const teamMembersTable = screen.getByTestId("team-members");
        //   const editButton =
        //     await within(teamMembersTable).findByTestId("edit-button-3");
        //   await user.click(editButton);

        //   const teamAdminSwitch = await screen.findByLabelText("Team Admin");
        //   await user.click(teamAdminSwitch);

        //   const updateUserButton = await screen.findByRole("button", {
        //     name: "Update user",
        //   });
        //   await user.click(updateUserButton);

        //   const membersTable = await screen.findByTestId(
        //     "members-table-add-member",
        //   );
        //   await waitFor(() => {
        //     expect(
        //       within(membersTable).getByText(/Team admin/),
        //     ).toBeInTheDocument();
        //   });
        // });
        // });
      );
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
      it("does not show the Team Admin switch in the add member modal", async () => {
        const { user } = await setupTeamMembersScreen();

        const teamMembersTable = screen.getByTestId("team-members");
        const addMemberButton =
          await within(teamMembersTable).findByText("Add a new member");
        await user.click(addMemberButton);

        const modal = await screen.findByTestId("modal-create-user");
        await userEntersInput("Email address", "newuser@test.com", modal, user);

        const continueButton = await screen.findByTestId(
          "modal-create-user-button",
        );
        await user.click(continueButton);

        const teamAdminSwitch = within(modal).queryByLabelText("Team Admin");
        expect(teamAdminSwitch).not.toBeInTheDocument();
      });
    });

    describe("editing existing members", () => {
      it("does not show the Team Admin switch in the edit member modal", async () => {
        const { user } = await setupTeamMembersScreen();

        const teamMembersTable = screen.getByTestId("team-members");
        const editButton =
          await within(teamMembersTable).findByTestId("edit-button-3");
        await user.click(editButton);

        const modal = await screen.findByTestId("modal-edit-user");
        const teamAdminSwitch = within(modal).queryByLabelText("Team Admin");

        expect(teamAdminSwitch).not.toBeInTheDocument();
      });
    });
  });
});

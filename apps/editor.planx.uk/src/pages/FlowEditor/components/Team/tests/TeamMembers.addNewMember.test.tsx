import { screen, waitFor, within } from "@testing-library/react";
import { FullStore, useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import server from "test/mockServer";
import { axe } from "vitest-axe";

import { setup } from "../../../../../testUtils";
import { UserUpsertModal } from "../components/UserUpsertModal";
import { setupTeamMembersScreen } from "./helpers/setupTeamMembersScreen";
import { userTriesToAddNewMember } from "./helpers/userTriesToAddNewMember";
import { createUserHandler } from "./mocks/handlers";
import {
  mockPlainUser,
  mockPlatformAdminUser,
} from "./mocks/users";

let initialState: FullStore;

describe("when a user presses 'add a new member'", () => {
  beforeEach(async () => {
    useStore.setState({
      user: mockPlatformAdminUser,
    });

    const { user } = await setupTeamMembersScreen();

    const teamMembersTable = screen.getByTestId("team-members");
    const addMemberButton =
      await within(teamMembersTable).findByText("Add a new member");
    user.click(addMemberButton);
  });

  it("opens the modal and displays the input fields", async () => {
    expect(await screen.findByTestId("modal-create-user-button")).toBeVisible();
    expect(await screen.findByLabelText("First name")).toBeVisible();
  });
});

describe("when a user fills in the 'add a new member' form correctly", () => {
  beforeAll(() => (initialState = useStore.getState()));
  afterAll(() => useStore.setState(initialState));

  beforeEach(async () => {
    useStore.setState({
      user: mockPlatformAdminUser,
    });

    server.use(createUserHandler());

    const { user } = await setupTeamMembersScreen();
    await userTriesToAddNewMember(user);
  });

  it("adds the new user row to the Team Members table", async () => {
    const membersTable = screen.getByTestId("members-table-add-member");

    await waitFor(() => {
      expect(
        within(membersTable).getByText(/Mickey Mouse/),
      ).toBeInTheDocument();
    });
  });

  it("closes the modal", async () => {
    await waitFor(() => {
      expect(screen.queryByTestId("modal-create-user")).not.toBeInTheDocument();
    });
  });

  it("shows a success message", async () => {
    expect(
      await screen.findByText(/Successfully added a user/),
    ).toBeInTheDocument();
  });
});

describe("when the addNewMember modal is rendered", () => {
  it("should not have any accessibility issues", async () => {
    const { container } = await setup(
      <DndProvider backend={HTML5Backend}>
        <UserUpsertModal
          showModal={true}
          setShowModal={() => { }}
          action="add"
        />
      </DndProvider>,
    );
    await screen.findByTestId("modal-create-user");

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("'add a new member' button is hidden from Templates team", () => {
  beforeEach(async () => {
    useStore.setState({
      user: mockPlatformAdminUser,
      teamSlug: "templates",
    });

    await setupTeamMembersScreen();
  });

  it("hides the button on the Templates team", async () => {
    const teamMembers = screen.getByTestId("team-members");
    const addMemberButton = within(teamMembers).queryByText("Add a new member");
    expect(addMemberButton).not.toBeInTheDocument();
  });
});

describe("when a user is not a platform admin", () => {
  beforeEach(async () => {
    useStore.setState({
      user: mockPlainUser,
    });

    await setupTeamMembersScreen();
  });

  it("hides the button from non-admin users", async () => {
    const teamMembersTable = screen.getByTestId("team-members");
    const addMemberButton =
      within(teamMembersTable).queryByText("Add a new member");
    expect(addMemberButton).not.toBeInTheDocument();
  });
});

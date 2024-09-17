import { screen, waitFor, within } from "@testing-library/react";
import { FullStore, useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import { setup } from "../../../../../testUtils";
import { EditorUpsertModal } from "../components/EditorUpsertModal";
import { setupTeamMembersScreen } from "./helpers/setupTeamMembersScreen";
import { userTriesToAddNewEditor } from "./helpers/userTriesToAddNewEditor";
import { mockTeamMembersData } from "./mocks/mockTeamMembersData";
import { emptyTeamMemberObj } from "./mocks/mockUsers";

vi.mock(
  "pages/FlowEditor/components/Team/queries/createAndAddUserToTeam.tsx",
  () => ({
    createAndAddUserToTeam: vi.fn().mockResolvedValue({
      id: 1,
      __typename: "users",
    }),
  }),
);

let initialState: FullStore;

describe("when a user presses 'add a new editor'", () => {
  beforeEach(async () => {
    useStore.setState({ teamMembers: mockTeamMembersData, teamSlug: "planx" });
    const { user } = await setupTeamMembersScreen();

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
  afterAll(() => useStore.setState(initialState));
  beforeEach(async () => {
    useStore.setState({ teamMembers: mockTeamMembersData, teamSlug: "planx" });
    const { user } = await setupTeamMembersScreen();
    await userTriesToAddNewEditor(user);
  });

  it("adds the new user row to the Team Editors table", async () => {
    const membersTable = screen.getByTestId("members-table-add-editor");

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

describe("when the addNewEditor modal is rendered", () => {
  it("should not have any accessibility issues", async () => {
    const { container } = setup(
      <DndProvider backend={HTML5Backend}>
        <EditorUpsertModal
          showModal={true}
          setShowModal={() => {}}
          initialValues={emptyTeamMemberObj}
          actionType="add"
        />
      </DndProvider>,
    );
    await screen.findByTestId("modal-create-user");

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("'add a new editor' button is hidden from Templates team", () => {
  beforeEach(async() => {
    useStore.setState({ teamMembers: mockTeamMembersData, teamSlug: "templates" });
  });

  it("hides the button on the Templates team", async () => {
    const { user: _user } = await setupTeamMembersScreen();
    const teamEditorsTable = screen.getByTestId("team-editors");
    const addEditorButton = within(teamEditorsTable).queryByText("Add a new editor");
    expect(addEditorButton).not.toBeInTheDocument();
  });
});

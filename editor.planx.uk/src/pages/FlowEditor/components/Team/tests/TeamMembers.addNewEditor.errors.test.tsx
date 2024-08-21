import { screen, within } from "@testing-library/react";
import { FullStore, useStore } from "pages/FlowEditor/lib/store";

import { TeamMember } from "../types";
import { exampleTeamMembersData } from "./exampleTeamMembersData";
import { setupTeamMembersScreen } from "./helpers/setupTeamMembersScreen";
import { userTriesToAddNewEditor } from "./helpers/userTriesToAddNewEditor";

jest.mock("lib/featureFlags.ts", () => ({
  hasFeatureFlag: jest.fn().mockReturnValue(true),
}));

const GRAPHQL_USER_ALREADY_EXISTS_ERROR = {
  message:
    'Uniqueness violation. duplicate key value violates unique constraint "users_email_key"',
  graphQLErrors: [
    {
      message:
        'Uniqueness violation. duplicate key value violates unique constraint "users_email_key"',
      extensions: {
        path: "$.selectionSet.insert_users_one.args.object[0]",
        code: "constraint-violation",
      },
    },
  ],
};

jest.mock(
  "pages/FlowEditor/components/Team/queries/createAndAddUserToTeam.tsx",
  () => ({
    createAndAddUserToTeam: jest
      .fn()
      .mockRejectedValue(GRAPHQL_USER_ALREADY_EXISTS_ERROR),
  }),
);

let initialState: FullStore;

const alreadyExistingUser: TeamMember = {
  firstName: "Mickey",
  lastName: "Mouse",
  email: "mickeymouse@email.com",
  id: 3,
  role: "teamEditor",
};

describe("when a user fills in the 'add a new editor' form correctly but the user already exists", () => {
  afterAll(() => useStore.setState(initialState));
  beforeEach(async () => {
    useStore.setState({
      teamMembers: [...exampleTeamMembersData, alreadyExistingUser],
    });

    const user = await setupTeamMembersScreen();
    await userTriesToAddNewEditor(user);
  });

  it("shows an appropriate error message", async () => {
    const addNewEditorModal = await screen.findByTestId("dialog-create-user");

    expect(
      await within(addNewEditorModal).findByText(/User already exists/),
    ).toBeInTheDocument();
  });
});

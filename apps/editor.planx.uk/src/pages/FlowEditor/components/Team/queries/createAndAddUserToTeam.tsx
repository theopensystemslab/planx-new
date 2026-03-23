import { FetchResult, gql } from "@apollo/client";
import { GET_USERS_FOR_TEAM_QUERY } from "routes/_authenticated/app/$team/members";

import { client } from "../../../../../lib/graphql";
import { AddNewEditorFormValues } from "../types";

type CreateAndAddUserResponse = FetchResult<{
  insertUsersOne: { id: number; __typename: "users" };
}>;

export const createAndAddUserToTeam = async ({
  newUser,
  teamId,
  teamSlug,
}: {
  newUser: AddNewEditorFormValues;
  teamId: number;
  teamSlug: string;
}) => {
  const response: CreateAndAddUserResponse = await client.mutate({
    mutation: gql`
      mutation CreateAndAddUserToTeam(
        $email: String!
        $firstName: String!
        $lastName: String!
        $teamId: Int!
        $role: user_roles_enum!
      ) {
        insertUsersOne: insert_users_one(
          object: {
            email: $email
            first_name: $firstName
            last_name: $lastName
            default_team_id: $teamId
            teams: { data: { role: $role, team_id: $teamId } }
          }
        ) {
          id
        }
      }
    `,
    variables: {
      ...newUser,
      teamId,
    },
    refetchQueries: [
      { query: GET_USERS_FOR_TEAM_QUERY, variables: { teamSlug } },
    ],
  });

  if (response.data) {
    return response.data.insertUsersOne;
  }
  throw new Error("Unable to create user");
};

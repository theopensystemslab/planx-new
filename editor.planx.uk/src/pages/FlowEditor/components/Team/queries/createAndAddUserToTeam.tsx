import { FetchResult, gql } from "@apollo/client";
import { GET_USERS_FOR_TEAM_QUERY } from "routes/teamMembers";

import { client } from "../../../../../lib/graphql";

type CreateAndAddUserResponse = FetchResult<{
  insert_users_one: { id: number; __typename: "users" };
}>;

export const createAndAddUserToTeam = async (
  email: string,
  firstName: string,
  lastName: string,
  teamId: number,
  teamSlug: string,
) => {
  // NB: the user is hard-coded with the 'teamEditor' role for now
  const response: CreateAndAddUserResponse = await client.mutate({
    mutation: gql`
      mutation CreateAndAddUserToTeam(
        $email: String!
        $firstName: String!
        $lastName: String!
        $teamId: Int!
      ) {
        insert_users_one(
          object: {
            email: $email
            first_name: $firstName
            last_name: $lastName
            teams: { data: { role: teamEditor, team_id: $teamId } }
          }
        ) {
          id
        }
      }
    `,
    variables: {
      email,
      firstName,
      lastName,
      teamId,
    },
    refetchQueries: [
      { query: GET_USERS_FOR_TEAM_QUERY, variables: { teamSlug } },
    ],
  });

  if (response.data) {
    return response.data.insert_users_one;
  }
  throw new Error("Unable to create user");
};

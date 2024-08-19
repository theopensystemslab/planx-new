import { gql } from "@apollo/client";

import { client } from "../../../../../lib/graphql";

export const createAndAddUserToTeam = async (
  email: string,
  firstName: string,
  lastName: string,
  teamId: number,
) => {
  // NB: the user is hard-coded with the 'teamEditor' role for now
  const response = (await client.mutate({
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
  })) as any;
  return response.data.insert_users_one;
};

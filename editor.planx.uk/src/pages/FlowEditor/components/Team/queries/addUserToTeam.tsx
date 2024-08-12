import { gql } from "@apollo/client";
import { client } from "lib/graphql";

export const addUserToTeam = async (teamId: number, userId: number) => {
  const response = await client.mutate({
    mutation: gql`
      mutation AddUserToTeam($teamId: Int!, $userId: Int!) {
        insert_team_members_one(
          object: { team_id: $teamId, user_id: $userId, role: teamEditor }
        ) {
          team_id
          user_id
          role
        }
      }
    `,
    variables: {
      teamId,
      userId,
    },
  });

  const res = response.data.insert_team_members_one;
  console.log(res);
  return res;
};

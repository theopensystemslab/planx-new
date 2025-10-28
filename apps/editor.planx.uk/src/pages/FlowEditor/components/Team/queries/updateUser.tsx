import { gql } from "@apollo/client";

import { client } from "../../../../../lib/graphql";
import { AddNewEditorFormValues } from "../types";

export const updateTeamMember = async (
  userId: number,
  userValues: AddNewEditorFormValues,
) => {
  const response = await client.mutate({
    mutation: gql`
      mutation UpdateUser($userId: Int, $userValues: users_set_input) {
        update_users(where: { id: { _eq: $userId } }, _set: $userValues) {
          returning {
            id
          }
        }
      }
    `,
    variables: {
      userId: userId,
      userValues: {
        first_name: userValues.firstName,
        last_name: userValues.lastName,
        email: userValues.email,
      },
    },
  });
  if (response.data) {
    return response.data.update_users;
  }
  throw new Error("Unable to update user");
};

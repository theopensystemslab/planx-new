import { gql } from "@apollo/client";

import { client } from "../../../../../lib/graphql";
import { AddNewEditorFormValues } from "../types";

export const updateUser = async (
  userId: number,
  userValues: AddNewEditorFormValues,
) => {
  const response = await client.mutate({
    mutation: gql`
      mutation UpdateUser($userId: Int, $userValues: users_set_input) {
        update_users(where: { id: { _eq: $userId } }, _set: $userValues) {
          returning {
            first_name
            email
            last_name
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

  return response;
};

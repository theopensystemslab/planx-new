import { gql } from "@apollo/client";
import { client } from "lib/graphql";

export const CREATE_USER_QUERY = gql`
  mutation CreateUser(
    $email: String!
    $firstName: String!
    $lastName: String!
    $isPlatformAdmin: Boolean
  ) {
    insert_users_one(
      object: {
        email: $email
        first_name: $firstName
        last_name: $lastName
        is_platform_admin: $isPlatformAdmin
      }
    ) {
      id
      email
      first_name
      last_name
      is_platform_admin
    }
  }
`;

export const createUser = async (
  email: string,
  firstName: string,
  lastName: string,
  isPlatformAdmin?: boolean,
) => {
  const response = (await client.mutate({
    mutation: CREATE_USER_QUERY,
    variables: {
      email,
      firstName,
      lastName,
      isPlatformAdmin,
    },
  })) as any;
  const { id, email: emailAddress } = response.data.insert_users_one;

  console.log("created a user with id: ", id, "and email: ", emailAddress);
  return { id, emailAddress };
};

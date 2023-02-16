import { gql } from "graphql-request";
import type { GraphQLClient } from "graphql-request";

export async function createUser(
  client: GraphQLClient,
  args: { firstName: string; lastName: string; email: string }
): Promise<number> {
  const { insert_users_one: response } = await client.request(
    gql`
      mutation CreateUser(
        $first_name: String!
        $last_name: String!
        $email: String!
      ) {
        insert_users_one(
          object: {
            first_name: $first_name
            last_name: $last_name
            email: $email
          }
        ) {
          id
        }
      }
    `,
    {
      first_name: args.firstName,
      last_name: args.lastName,
      email: args.email,
    }
  );
  return response.id;
}

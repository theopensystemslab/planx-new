import { sign } from "jsonwebtoken";
import { adminGraphQLClient as adminClient } from "../../hasura";
import { gql } from "graphql-request";

export const buildJWT = async (email: string | undefined) => {
  const { users } = await adminClient.request(
    gql`
      query ($email: String!) {
        users(where: { email: { _eq: $email } }, limit: 1) {
          id
        }
      }
    `,
    { email },
  );

  if (!users.length) return;

  const { id } = users[0];

  const hasura = {
    "x-hasura-allowed-roles": ["admin"],
    "x-hasura-default-role": "admin",
    "x-hasura-user-id": id.toString(),
  };

  const data = {
    sub: id.toString(),
    "https://hasura.io/jwt/claims": hasura,
  };

  const jwt = sign(data, process.env.JWT_SECRET!);
  return jwt;
};

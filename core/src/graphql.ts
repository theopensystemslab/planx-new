import { GraphQLClient } from "graphql-request";

export function graphQLClient({
  url,
  secret,
}: {
  url: string;
  secret?: string | undefined;
}): GraphQLClient {
  let headers = {};
  if (secret) headers = { "X-Hasura-Admin-Secret": secret };
  return new GraphQLClient(url, { headers });
}

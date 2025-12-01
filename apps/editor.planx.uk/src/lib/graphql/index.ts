import {
  ApolloClient,
  from,
  InMemoryCache,
  Operation,
  split,
} from "@apollo/client";

import { errorLink } from "./errors";
import { authSplitLink, publicHttpLink, retryLink } from "./links";

const isPublicOperation = (operation: Operation) => {
  const context = operation.getContext();

  if (
    context.role === "public" ||
    context.headers?.["x-hasura-role"] === "public"
  ) {
    return true;
  }

  return false;
};

const trafficRouter = split(
  // Public traffic
  isPublicOperation,
  publicHttpLink,

  // Authenticated traffic
  authSplitLink,
);

export const client = new ApolloClient({
  link: from([retryLink, errorLink, trafficRouter]),
  cache: new InMemoryCache(),
});

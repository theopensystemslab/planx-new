import { ApolloLink, createHttpLink, split } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { RetryLink } from "@apollo/client/link/retry";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { toast } from "react-toastify";

import { getJWT, handleExpiredJWTErrors } from "./auth";

const toastId = "error_toast";

const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const fetchResult = await fetch(input, init);
  const isGraphQLError = Object.prototype.hasOwnProperty.call(
    fetchResult.body,
    "errors",
  );
  const isSuccess =
    isGraphQLError || (fetchResult.status >= 200 && fetchResult.status <= 299);

  if (isSuccess) {
    toast.dismiss(toastId);
  }
  return fetchResult;
};

export const retryLink = new RetryLink({
  delay: { initial: 500, max: Infinity },
  attempts: { max: Infinity },
});

export const publicHttpLink = createHttpLink({
  uri: import.meta.env.VITE_APP_HASURA_URL,
  fetch: customFetch,
  headers: { "x-hasura-role": "public" },
});

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_APP_HASURA_URL,
  fetch: customFetch,
});

/**
 * Set auth header in Apollo client
 * Must be done post-authentication once we have a value for JWT
 */
const authMiddleware = setContext(async (_operation, { headers }) => {
  const jwt = await getJWT();
  return {
    headers: {
      ...headers,
      authorization: jwt ? `Bearer ${jwt}` : undefined,
    },
  };
});

export const authHttpLink = authMiddleware.concat(httpLink);

let _wsLink: WebSocketLink | null = null;

const getWsLink = () => {
  if (!_wsLink) {
    _wsLink = new WebSocketLink({
      uri: import.meta.env.VITE_APP_HASURA_WEBSOCKET!,
      options: {
        reconnect: true,
        connectionParams: async () => {
          const jwt = await getJWT();
          return {
            headers: {
              authorization: jwt ? `Bearer ${jwt}` : undefined,
            },
          };
        },
        connectionCallback: (error) => {
          if (error) handleExpiredJWTErrors();
        },
      },
    });
  }
  return _wsLink;
};

/**
 * Authenticated web socket connection - used for GraphQL subscriptions
 * Lazy loaded so that it's only instantiated when first called,
 * not sitting idle sending "keep-alive" messages ({ type: "ka" })
 */
export const authWsLink = new ApolloLink((req) => getWsLink().request(req));

/**
 * Split authenticated requests between HTTPS and WS, based on operation types
 *  - Queries and mutations -> HTTPS
 *  - Subscriptions -> WS
 */
export const authSplitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  authWsLink,
  authHttpLink,
);

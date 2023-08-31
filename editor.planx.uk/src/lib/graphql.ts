import {
  ApolloClient,
  createHttpLink,
  DefaultContext,
  from,
  InMemoryCache,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";
import { toast } from "react-toastify";

import { getCookie } from "./cookie";

const toastId = "error_toast";

// function used to verify response status
const customFetch = async (
  input: RequestInfo,
  init?: RequestInit,
): Promise<Response> => {
  const fetchResult = await fetch(input, init);
  // eslint-disable-next-line no-prototype-builtins
  const isGraphQLError = fetchResult.body?.hasOwnProperty("errors");
  const isSuccess =
    isGraphQLError || (fetchResult.status >= 200 && fetchResult.status <= 299);
  if (isSuccess) {
    // NB: it's okay if toast.dismiss() gets called more than once
    toast.dismiss(toastId);
  }

  return fetchResult;
};

const authHttpLink = createHttpLink({
  uri: process.env.REACT_APP_HASURA_URL,
  fetch: customFetch,
  headers: {
    authorization: `Bearer ${getCookie("jwt")}`,
  },
});

const publicHttpLink = createHttpLink({
  uri: process.env.REACT_APP_HASURA_URL,
  fetch: customFetch,
  headers: { "x-hasura-role": "public" },
});

const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors) {
    // GraphQL errors are not retried
    graphQLErrors.map(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    );
  } else {
    toast.error("Network error, attempting to reconnect…", {
      toastId,
      autoClose: false,
      hideProgressBar: true,
      progress: undefined,
    });
  }
});

const retryLink = new RetryLink({
  delay: {
    initial: 500,
    max: Infinity,
  },
  attempts: {
    max: Infinity,
  },
});

/**
 * Client used to make all requests by authorised users
 */
export const client = new ApolloClient({
  link: from([retryLink, errorLink, authHttpLink]),
  cache: new InMemoryCache(),
});

/**
 * Client used to make requests in all public interface
 * e.g. /preview, /unpublished, /pay
 */
export const publicClient = new ApolloClient({
  link: from([retryLink, errorLink, publicHttpLink]),
  cache: new InMemoryCache(),
});

/**
 * Connect to Hasura using the "public" role
 */
export const publicContext: DefaultContext = {
  headers: {
    "x-hasura-role": "public"
  }
}

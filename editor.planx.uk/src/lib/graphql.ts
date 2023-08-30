import {
  ApolloClient,
  createHttpLink,
  from,
  InMemoryCache,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
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

const httpLink = createHttpLink({
  uri: process.env.REACT_APP_HASURA_URL,
  fetch: customFetch,
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

const authLink = setContext((_, { headers }) => {
  // get the authentication token from cookies if it exists
  const token = getCookie("jwt");
  // return the headers to the context so httpLink can read them

  if (token) {
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : null,
      },
    };
  } else {
    return {
      headers,
    };
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

export const client = new ApolloClient({
  link: from([retryLink, errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});

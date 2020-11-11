import {
  ApolloClient,
  createHttpLink,
  from,
  InMemoryCache,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import Cookies from "js-cookie";

import { navigation } from "../.";

const httpLink = createHttpLink({
  uri: (import.meta as any).env.REACT_APP_HASURA_URL,
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );

  if (networkError) {
    navigation.navigate("/network-error");
  }
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from cookies if it exists
  const token = Cookies.get("jwt");
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

export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});

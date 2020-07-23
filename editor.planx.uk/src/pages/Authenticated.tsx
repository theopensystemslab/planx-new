import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import Cookies from "js-cookie";
import React from "react";
import Teams from "./Teams";

const httpLink = createHttpLink({
  uri: process.env.REACT_APP_HASURA_URL,
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from cookies if it exists
  const token = Cookies.get("jwt");
  // return the headers to the context so httpLink can read them

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : null,
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

const Authenticated = () => (
  <ApolloProvider client={client}>
    <div>
      <Teams />
      <button
        onClick={() => {
          Cookies.remove("jwt");
          client.resetStore();
          window.location.reload();
        }}
      >
        logout
      </button>
    </div>
  </ApolloProvider>
);

export default Authenticated;

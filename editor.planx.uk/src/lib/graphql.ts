import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import Cookies from "js-cookie";

const httpLink = createHttpLink({
  uri: process.env.REACT_APP_HASURA_URL,
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
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

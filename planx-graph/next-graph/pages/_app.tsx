import { createClient, Provider } from "urql";
import "../styles/globals.css";

const client = createClient({
  url: "http://localhost:7000/v1/graphql",
  fetchOptions: () => {
    return {
      headers: { "x-hasura-admin-secret": "TODO" },
    };
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <Provider value={client}>
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp;

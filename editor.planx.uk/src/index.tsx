import { ApolloProvider } from "@apollo/client";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
import Cookies from "js-cookie";
import { createBrowserNavigation } from "navi";
import React, { Suspense } from "react";
import { render } from "react-dom";
import { NotFoundBoundary, Router, useLoadingRoute, View } from "react-navi";
import HelmetProvider from "react-navi-helmet-async";
import "./app.css";
import DelayedLoadingIndicator from "./components/DelayedLoadingIndicator";
import { client } from "./lib/graphql";
import routes from "./routes";
import * as serviceWorker from "./serviceWorker";
import theme from "./theme";

const rootEl = document.getElementById("root") as HTMLElement;

const Layout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const isLoading = useLoadingRoute();
  return (
    <ThemeProvider theme={theme}>
      <NotFoundBoundary render={() => <h1>Not found</h1>}>
        {!!isLoading ? (
          <DelayedLoadingIndicator msDelayBeforeVisible={500} />
        ) : (
          children
        )}
      </NotFoundBoundary>
    </ThemeProvider>
  );
};

export const navigation = createBrowserNavigation({
  routes,
});

render(
  <ApolloProvider client={client}>
    <Router
      context={{ currentUser: Cookies.get("jwt") }}
      navigation={navigation}
    >
      <HelmetProvider>
        <Layout>
          <CssBaseline />
          <Suspense fallback={null}>
            <View />
          </Suspense>
        </Layout>
      </HelmetProvider>
    </Router>
  </ApolloProvider>,
  rootEl
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

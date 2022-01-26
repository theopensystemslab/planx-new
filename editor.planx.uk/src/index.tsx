// init airbrake before everything else
require("./airbrake");

import "react-toastify/dist/ReactToastify.css";
import "./app.css";

import { ApolloProvider } from "@apollo/client";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
import { MyMap } from "@opensystemslab/map";
import jwtDecode from "jwt-decode";
import { getCookie, setCookie } from "lib/cookie";
import React, { Suspense } from "react";
import { render } from "react-dom";
import { NotFoundBoundary, Router, useLoadingRoute, View } from "react-navi";
import HelmetProvider from "react-navi-helmet-async";
import { ToastContainer } from "react-toastify";
import { RoutingContext } from "routes";

import DelayedLoadingIndicator from "./components/DelayedLoadingIndicator";
import { client } from "./lib/graphql";
import navigation from "./lib/navigation";
import theme from "./theme";

const rootEl = document.getElementById("root") as HTMLElement;

if (!window.customElements.get("my-map")) {
  window.customElements.define("my-map", MyMap);
}

const setJWTCookieFromQueryParams = (): void => {
  const jwt = new URLSearchParams(window.location.search).get("jwt");
  if (!jwt) return;
  // Set the JWT, and remove it from the url
  setCookie("jwt", jwt);
  window.location.href = "/";
};

const getContextFromJWT = (): RoutingContext | undefined => {
  const jwt = getCookie("jwt") || setJWTCookieFromQueryParams();
  // Re-run this function if we did not get the JWT from the cookie
  if (!jwt) return;
  try {
    const userId = Number(
      (jwtDecode(jwt!) as any)["https://hasura.io/jwt/claims"][
        "x-hasura-user-id"
      ]
    );
    return { currentUser: { userId } };
  } catch (e) {
    window.location.href = "/logout";
  }
};

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

render(
  <>
    <ApolloProvider client={client}>
      <Router context={getContextFromJWT()} navigation={navigation}>
        <HelmetProvider>
          <Layout>
            <CssBaseline />
            <Suspense fallback={null}>
              <View />
            </Suspense>
          </Layout>
        </HelmetProvider>
      </Router>
    </ApolloProvider>
    <ToastContainer />
  </>,
  rootEl
);

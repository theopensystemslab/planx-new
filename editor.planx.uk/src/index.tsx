// init airbrake before everything else
require("./airbrake");

import "react-toastify/dist/ReactToastify.css";
import "./app.css";

import { ApolloProvider } from "@apollo/client";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
import jwtDecode from "jwt-decode";
import { getCookie, setCookie } from "lib/cookie";
import React, { Suspense } from "react";
import { render } from "react-dom";
import { NotFoundBoundary, Router, useLoadingRoute, View } from "react-navi";
import HelmetProvider from "react-navi-helmet-async";
import { ToastContainer } from "react-toastify";

import DelayedLoadingIndicator from "./components/DelayedLoadingIndicator";
import { client } from "./lib/graphql";
import navigation from "./lib/navigation";
import theme from "./theme";

const rootEl = document.getElementById("root") as HTMLElement;

const hasJWT = (): boolean | void => {
  let jwt = getCookie("jwt");
  if (jwt) {
    try {
      if (
        Number(
          (jwtDecode(jwt) as any)["https://hasura.io/jwt/claims"][
            "x-hasura-user-id"
          ]
        ) > 0
      ) {
        return true;
      }
    } catch (e) {}
    window.location.href = "/logout";
  } else {
    jwt = new URLSearchParams(window.location.search).get("jwt");
    if (jwt) {
      setCookie("jwt", jwt);
      // set the jwt, and remove it from the url, then re-run this function
      window.location.href = "/";
    } else {
      return false;
    }
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
      <Router context={{ currentUser: hasJWT() }} navigation={navigation}>
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

import "core-js/actual/string/replace-all"; // replace-all polyfill
import "./app.css";

import { ApolloProvider } from "@apollo/client";
import CssBaseline from "@mui/material/CssBaseline";
import { MyMap } from "@opensystemslab/map";
import { Layout } from "components/Layout";
import { ToastContextProvider } from "contexts/ToastContext";
import useApolloClientSetup from "hooks/useApolloClientSetup";
import { getCookie, setCookie } from "lib/cookie";
import { AnalyticsProvider } from "pages/FlowEditor/lib/analytics/provider";
import React, { Suspense } from "react";
import { Router, View } from "react-navi";
import HelmetProvider from "react-navi-helmet-async";

// import { client } from "./lib/graphql";
import navigation from "./lib/navigation";

const App = () => {
  if (!window.customElements.get("my-map")) {
    window.customElements.define("my-map", MyMap);
  }

  const hasJWT = (): boolean | void => {
    // This cookie indicates the presence of the secure httpOnly "jwt" cookie
    const authCookie = getCookie("auth");
    if (authCookie) return true;

    // If JWT not set via cookie, check search params
    const jwtSearchParams = new URLSearchParams(window.location.search).get(
      "jwt",
    );
    if (!jwtSearchParams) return false;

    // Remove JWT from URL, and re-run this function
    setCookie("jwt", jwtSearchParams);
    setCookie("auth", { loggedIn: true });
    // TODO: observe any redirect in secure fashion
    window.location.href = "/";
  };
  const { client } = useApolloClientSetup();

  return (
    <ToastContextProvider>
      <ApolloProvider client={client}>
        <AnalyticsProvider>
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
        </AnalyticsProvider>
      </ApolloProvider>
    </ToastContextProvider>
  );
};

export default App;

import "core-js/actual/string/replace-all"; // replace-all polyfill
import "react-toastify/dist/ReactToastify.css";
import "./app.css";

import { ApolloProvider } from "@apollo/client";
import CssBaseline from "@mui/material/CssBaseline";
import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { MyMap } from "@opensystemslab/map";
import { ToastContextProvider } from "contexts/ToastContext";
import { getCookie, setCookie } from "lib/cookie";
import ErrorPage from "pages/ErrorPage";
import { AnalyticsProvider } from "pages/FlowEditor/lib/analytics/provider";
import React, { Suspense, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { NotFoundBoundary, Router, useLoadingRoute, View } from "react-navi";
import HelmetProvider from "react-navi-helmet-async";
import { ToastContainer } from "react-toastify";

// init airbrake before everything else
import * as airbrake from "./airbrake";
import DelayedLoadingIndicator from "./components/DelayedLoadingIndicator";
import { client } from "./lib/graphql";
import navigation from "./lib/navigation";
import { defaultTheme } from "./theme";

if (import.meta.env.VITE_APP_ENV !== "production") {
  console.log(`ENV: ${import.meta.env.VITE_APP_ENV}`);
}

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

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

const Layout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const isLoading = useLoadingRoute();

  useEffect(() => {
    const observer = new MutationObserver(() => {
      // set the page title based on whatever heading is currently shown
      // on screen. If there's no heading then the title will be "PlanX"
      document.title = [
        document.querySelector("[role=heading],h1,h2,h3")?.textContent,
        "PlanX",
      ]
        .filter(Boolean)
        .join(" - ");
    });

    observer.observe(document.getElementById("root")!, {
      attributes: false,
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={defaultTheme}>
        <NotFoundBoundary render={() => <ErrorPage title="Not found" />}>
          {isLoading ? (
            <DelayedLoadingIndicator msDelayBeforeVisible={500} />
          ) : (
            children
          )}
        </NotFoundBoundary>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

root.render(
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
    <ToastContainer icon={false} theme="colored" />
  </ToastContextProvider>,
);

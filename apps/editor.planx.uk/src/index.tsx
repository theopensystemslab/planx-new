import "core-js/actual/string/replace-all"; // replace-all polyfill
import "react-toastify/dist/ReactToastify.css";
import "./app.css";

import { ApolloProvider } from "@apollo/client";
import CssBaseline from "@mui/material/CssBaseline";
import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { MyMap } from "@opensystemslab/map";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  createRouter,
  RouterProvider as TanStackRouterProvider,
} from "@tanstack/react-router";
import { ToastContextProvider } from "contexts/ToastContext";
import { getCookie, setCookie } from "lib/cookie";
import { initFeatureFlags } from "lib/featureFlags";
import { queryClient } from "lib/queryClient";
import { AnalyticsProvider } from "pages/FlowEditor/lib/analytics/provider";
import React, { Suspense, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { ToastContainer } from "react-toastify";

// init airbrake before everything else
import * as airbrake from "./airbrake";
import { client } from "./lib/graphql";
import { routeTree } from "./routeTree.gen";
import { defaultTheme } from "./theme";

if (import.meta.env.VITE_APP_ENV !== "production") {
  console.log(`ENV: ${import.meta.env.VITE_APP_ENV}`);
}

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

if (!window.customElements.get("my-map")) {
  window.customElements.define("my-map", MyMap);
}

// Refresh window if user hits "Failed to fetch dynamically imported module" due to renamed assets following re-build after deploy
// Docs: https://vite.dev/guide/build#load-error-handling
window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  window.location.reload();
});

initFeatureFlags();

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
  setCookie("auth", JSON.stringify({ loggedIn: true }));
  // Remove the jwt param from the URL
  const url = new URL(window.location.href);
  url.searchParams.delete("jwt");
  window.history.replaceState({}, document.title, url.pathname + url.search);

  // Return true to indicate authenticated state
  return true;
};

export const router = createRouter({
  routeTree,
  context: { currentUser: hasJWT() },
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const Layout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
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
      <ThemeProvider theme={defaultTheme}>{children}</ThemeProvider>
    </StyledEngineProvider>
  );
};

root.render(
  <ToastContextProvider>
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={client}>
        <AnalyticsProvider>
          <Layout>
            <CssBaseline />
            <Suspense fallback={null}>
              <TanStackRouterProvider router={router} />
            </Suspense>
          </Layout>
        </AnalyticsProvider>
      </ApolloProvider>
    </QueryClientProvider>
    <ToastContainer icon={false} theme="colored" />
  </ToastContextProvider>,
);

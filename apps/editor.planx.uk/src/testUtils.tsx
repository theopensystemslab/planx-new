/* eslint-disable no-restricted-imports */
import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { render, RenderResult, waitFor } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import userEvent from "@testing-library/user-event";
import { ToastContextProvider } from "contexts/ToastContext";
import React from "react";

import { defaultTheme } from "./theme";

const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
      staleTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});

const testApolloClient = new ApolloClient({
  link: new HttpLink({
    uri: "http://mock-api/graphql",
    fetch: (uri, options) => {
      //Known workaround for test environments where AbortSignal
      // instances from different contexts don't pass instanceof checks.
      //eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { signal, ...fetchOptions } = options || {};
      return fetch(uri, fetchOptions);
    },
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: "no-cache" },
    query: { fetchPolicy: "no-cache" },
  },
});

/**
 * Setup @testing-library/react environment with userEvent and TanStack Router
 * https://testing-library.com/docs/user-event/intro#writing-tests-with-userevent
 *
 * Note: This function is async to allow the router to finish rendering.
 * Tests must await the setup() call.
 */
export const setup = async (
  jsx: JSX.Element,
): Promise<Record<"user", UserEvent> & RenderResult> => {
  testQueryClient.clear();

  const rootRoute = createRootRoute({
    component: () => (
      <ToastContextProvider>
        <ApolloProvider client={testApolloClient}>
          <QueryClientProvider client={testQueryClient}>
            <ThemeProvider theme={defaultTheme}>
              <Outlet />
            </ThemeProvider>
          </QueryClientProvider>
        </ApolloProvider>
      </ToastContextProvider>
    ),
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => <>{jsx}</>,
  });

  const routeTree = rootRoute.addChildren([indexRoute]);

  const history = createMemoryHistory({
    initialEntries: ["/"],
  });

  const router = createRouter({
    routeTree,
    history,
    defaultPendingMinMs: 0,
  });

  const renderResult = render(<RouterProvider router={router} />);

  // Wait for router to finish initial render
  // Check that router state is idle (not pending/loading)
  await waitFor(
    () => {
      if (router.state.isLoading) {
        throw new Error("Router still loading");
      }
    },
    { timeout: 1000 },
  );

  return {
    user: userEvent.setup(),
    ...renderResult,
  };
};

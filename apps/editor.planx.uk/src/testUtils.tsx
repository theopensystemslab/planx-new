/* eslint-disable no-restricted-imports */
import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, RenderResult } from "@testing-library/react";
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
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: "no-cache" },
    query: { fetchPolicy: "no-cache" },
  },
});

/**
 * Setup @testing-library/react environment with userEvent
 * https://testing-library.com/docs/user-event/intro#writing-tests-with-userevent
 */
export const setup = (
  jsx: JSX.Element,
): Record<"user", UserEvent> & RenderResult => {
  testQueryClient.clear();

  return {
    user: userEvent.setup(),
    ...render(
      <ToastContextProvider>
        <ApolloProvider client={testApolloClient}>
          <QueryClientProvider client={testQueryClient}>
            <ThemeProvider theme={defaultTheme}>{jsx}</ThemeProvider>
          </QueryClientProvider>
        </ApolloProvider>
      </ToastContextProvider>,
    ),
  };
};

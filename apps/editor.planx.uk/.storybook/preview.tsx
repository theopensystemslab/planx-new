import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { defaultTheme } from "../src/theme";
import { MyMap } from "@opensystemslab/map";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initialize, mswLoader } from "msw-storybook-addon";
import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";

import { tanstackRouterDecorator } from "./__mocks__/tanstack-router";

if (!window.customElements.get("my-map")) {
  window.customElements.define("my-map", MyMap);
}

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

initialize();

export const decorators = [
  (Story) => (
    <ApolloProvider client={testApolloClient}>
      <QueryClientProvider client={testQueryClient}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={defaultTheme}>
            <CssBaseline />
            <DndProvider backend={HTML5Backend} key={Date.now()}>
              <Story />
            </DndProvider>
          </ThemeProvider>
        </StyledEngineProvider>
      </QueryClientProvider>
    </ApolloProvider>
  ),
  tanstackRouterDecorator,
];

export const tags = ["autodocs"];

export const loaders = [mswLoader];

export const parameters = {
  msw: {
    handlers: [],
  },
};

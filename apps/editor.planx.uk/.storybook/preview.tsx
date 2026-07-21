import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import CssBaseline from "@mui/material/CssBaseline";
import { StyledEngineProvider,ThemeProvider } from "@mui/material/styles";
import { MyMap } from "@opensystemslab/map";
import type { Decorator } from "@storybook/tanstack-react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initialize, mswLoader } from "msw-storybook-addon";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { defaultTheme } from "../src/theme";

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

export const decorators: Decorator[] = [
  (Story, context) => (
    <ApolloProvider client={testApolloClient}>
      <QueryClientProvider client={testQueryClient}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={defaultTheme}>
            <CssBaseline />
            <DndProvider backend={HTML5Backend} key={context.id}>
              <Story />
            </DndProvider>
          </ThemeProvider>
        </StyledEngineProvider>
      </QueryClientProvider>
    </ApolloProvider>
  ),
];

export const tags = ["autodocs"];

export const loaders = [mswLoader];

export const parameters = {
  msw: {
    handlers: [],
  },
};

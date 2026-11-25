import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { MyMap } from "@opensystemslab/map";
import type { Decorator } from "@storybook/tanstack-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mswLoader } from "msw-storybook-addon/csf3";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { defaultDarkTheme, defaultTheme } from "../src/theme";

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

export const decorators: Decorator[] = [
  (Story, context) => (
    <ApolloProvider client={testApolloClient}>
      <QueryClientProvider client={testQueryClient}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider
            theme={
              context.globals.theme === "dark" ? defaultDarkTheme : defaultTheme
            }
          >
            <CssBaseline enableColorScheme />
            <DndProvider backend={HTML5Backend} key={context.id}>
              {/* Docs pages render stories on a fixed white background, so apply the theme background explicitly */}
              <Box
                sx={{ bgcolor: "background.default", color: "text.primary" }}
              >
                <Story />
              </Box>
            </DndProvider>
          </ThemeProvider>
        </StyledEngineProvider>
      </QueryClientProvider>
    </ApolloProvider>
  ),
];

// Toolbar toggle to preview components in light and dark palette modes
export const globalTypes = {
  theme: {
    description: "Palette mode",
    toolbar: {
      title: "Theme",
      icon: "mirror",
      items: [
        { value: "light", title: "Light", icon: "sun" },
        { value: "dark", title: "Dark", icon: "moon" },
      ],
      dynamicTitle: true,
    },
  },
};

export const initialGlobals = {
  theme: "light",
};

export const tags = ["autodocs"];

export const loaders = [mswLoader()];

export const parameters = {
  msw: {
    handlers: [],
  },
};

import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import {
  ThemeProvider,
  StyledEngineProvider,
  createTheme,
} from "@mui/material/styles";
import { MyMap } from "@opensystemslab/map";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initialize, mswLoader } from "msw-storybook-addon";
import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import axe from "axe-core";
import { defaultTheme } from "../src/theme";

// Override transition durations to 0 so Fade/Collapse animations are instant.
// Without this, axe runs color-contrast checks mid-animation, seeing partially-opaque
// dark text composited against a white background as near-white (#fbfbfb on #ffffff),
// producing false-positive contrast violations with ~1.03 ratios.
const storybookTheme = createTheme({
  ...defaultTheme,
  transitions: {
    ...defaultTheme.transitions,
    duration: {
      ...defaultTheme.transitions.duration,
      shortest: 0,
      shorter: 0,
      short: 0,
      standard: 0,
      complex: 0,
      enteringScreen: 0,
      leavingScreen: 0,
    },
  },
});

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
  (Story, context) => {
    // Stories that render their own <main> landmark (e.g. pages that use the
    // shared Main component) set parameters.noMainWrapper = true so we don't
    // produce nested/duplicate <main> elements.
    const Wrapper = context.parameters?.noMainWrapper ? "div" : "main";
    return (
      <Wrapper>
        <ApolloProvider client={testApolloClient}>
          <QueryClientProvider client={testQueryClient}>
            <StyledEngineProvider injectFirst>
              <ThemeProvider theme={storybookTheme}>
                <CssBaseline />
                <DndProvider backend={HTML5Backend} key={Date.now()}>
                  <Story />
                </DndProvider>
              </ThemeProvider>
            </StyledEngineProvider>
          </QueryClientProvider>
        </ApolloProvider>
      </Wrapper>
    );
  },
];

// Runs within Storybook's story lifecycle (before DOM teardown), so axe
// sees the rendered story content. Using vitest's afterEach instead would
// fire after Storybook cleans up the DOM.
export const afterEach = async () => {
  const root = document.body;
  if (!root || root.children.length === 0) return;

  const results = await axe.run(root as Element);

  if (results.violations.length > 0) {
    const details = results.violations
      .map((v) => {
        const nodes = v.nodes
          .slice(0, 2)
          .map((n) => `    ${n.target}`)
          .join("\n");
        return `[${v.impact}] ${v.id}: ${v.description}\n${nodes}`;
      })
      .join("\n\n");

    throw new Error(`Accessibility violations:\n\n${details}`);
  }
};

export const tags = ["autodocs"];

export const loaders = [mswLoader];

export const parameters = {
  msw: {
    handlers: [],
  },
  a11y: {
    config: {
      rules: [{ id: "color-contrast", enabled: true }],
    },
  },
};

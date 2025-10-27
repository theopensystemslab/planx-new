/* eslint-disable no-restricted-imports */
import { ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, RenderResult } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import userEvent from "@testing-library/user-event";
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

/**
 * Setup @testing-library/react environment with userEvent
 * https://testing-library.com/docs/user-event/intro#writing-tests-with-userevent
 */
export const setup = (
  jsx: JSX.Element,
): Record<"user", UserEvent> & RenderResult => ({
  user: userEvent.setup(),
  ...render(
    <QueryClientProvider client={testQueryClient}>
      <ThemeProvider theme={defaultTheme}>{jsx}</ThemeProvider>
    </QueryClientProvider>,
  ),
});

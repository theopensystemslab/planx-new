/* eslint-disable no-restricted-imports */
import { ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";
import React from "react";

import { defaultTheme } from "./theme";

const testQueryClient = new QueryClient();

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

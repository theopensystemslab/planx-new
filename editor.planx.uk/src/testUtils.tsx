/* eslint-disable no-restricted-imports */
import { FadeProps, ThemeProvider } from "@mui/material";
import { render, RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";
import React from "react";
import { vi } from "vitest";

import { defaultTheme } from "./theme";

/**
 * Setup @testing-library/react environment with userEvent
 * https://testing-library.com/docs/user-event/intro#writing-tests-with-userevent
 */
export const setup = (
  jsx: JSX.Element,
): Record<"user", UserEvent> & RenderResult => ({
  user: userEvent.setup(),
  ...render(<ThemeProvider theme={defaultTheme}>{jsx}</ThemeProvider>),
});

/**
 * Mock the MUI Fade component used in @planx/components/shared/Preview/Card.tsx
 * Required as this frequently updates following the final "expect()" call of a test,
 * leading to multiple "an update was not wrapped in act(...)" warnings
 * Docs: https://testing-library.com/docs/example-react-transition-group/
 */
// export const mockFade = vi.mock("@mui/material/Fade", () =>
//   vi.fn(({ children }: FadeProps) => <div>{children}</div>),
// );

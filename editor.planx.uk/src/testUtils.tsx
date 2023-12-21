/* eslint-disable no-restricted-imports */
import { FadeProps, ThemeProvider } from "@mui/material";
import { render, RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";
import { configureAxe } from "jest-axe";
import React from "react";

import { defaultTheme } from "./theme";

export const axe = configureAxe({
  rules: {
    // Currently, jest-axe does not correctly evaluate this rule due to an issue with jsdom
    // https://github.com/dequelabs/axe-core/issues/2587
    // To pass this test, non-decorative MUI icons should always use the 'titleAccess' prop
    "svg-img-alt": { enabled: false },
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
  ...render(<ThemeProvider theme={defaultTheme}>{jsx}</ThemeProvider>),
});

/**
 * Mock the MUI Fade component used in @planx/components/shared/Preview/Card.tsx
 * Required as this frequently updates following the final "expect()" call of a test,
 * leading to multiple "an update was not wrapped in act(...)" warnings
 * Docs: https://testing-library.com/docs/example-react-transition-group/
 */
export const mockFade = jest.mock("@mui/material/Fade", () =>
  jest.fn(({ children }: FadeProps) => <div>{children}</div>),
);

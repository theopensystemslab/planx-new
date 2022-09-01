/* eslint-disable no-restricted-imports */
import { render, RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";
import { configureAxe } from "jest-axe";

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
  jsx: JSX.Element
): Record<"user", UserEvent> & RenderResult => ({
  user: userEvent.setup(),
  ...render(jsx),
});

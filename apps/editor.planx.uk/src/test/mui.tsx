import "@testing-library/jest-dom";
import "@testing-library/jest-dom/vitest";
import "vitest-axe/extend-expect";

import { CollapseProps } from "@mui/material/Collapse";
import { FadeProps } from "@mui/material/Fade";
import React from "react";
import { vi } from "vitest";

/**
 * Mock MUI animation components to prevent "an update was not wrapped in act()"
 * warnings. These components schedule internal state updates (measuring animated
 * element dimensions, managing ripple effects) that fire after the act() boundary.
 * Docs: https://testing-library.com/docs/example-react-transition-group/
 */
const mockFade = vi.fn(({ children }: FadeProps) => <div>{children}</div>);

const mockCollapse = vi.fn(
  ({
    children,
    in: inProp,
    id,
    "data-testid": dataTestId,
  }: CollapseProps & { "data-testid"?: string }) => (
    <div hidden={!inProp} id={id} data-testid={dataTestId}>
      {children}
    </div>
  ),
);

vi.mock("@mui/material/Fade", () => ({ default: mockFade }));
vi.mock("@mui/material/Collapse", () => ({ default: mockCollapse }));

beforeEach(() => {
  mockFade.mockClear();
  mockCollapse.mockClear();
});

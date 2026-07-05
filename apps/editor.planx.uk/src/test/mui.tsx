import "@testing-library/jest-dom";
import "vitest-axe/extend-expect";

import type { CollapseProps } from "@mui/material/Collapse";
import type { FadeProps } from "@mui/material/Fade";
import React from "react";
import { vi } from "vitest";

/**
 * Mock MUI animation components to prevent "an update was not wrapped in act()"
 * warnings. These components schedule internal state updates (measuring animated
 * element dimensions, managing ripple effects) that fire after the act() boundary.
 * Docs: https://testing-library.com/docs/example-react-transition-group/
 */
const mockFade = vi.fn(({ children }: FadeProps) => <div>{children}</div>);

// Separate named component so we can use hooks (vi.fn wrappers can't use hooks directly)
function MockCollapseImpl({
  children,
  in: inProp,
  onExited,
  id,
  "data-testid": dataTestId,
}: CollapseProps & { "data-testid"?: string }) {
  // Fire onExited immediately when closing to simulate animation completion
  React.useEffect(() => {
    if (!inProp) onExited?.(null!);
  }, [inProp, onExited]);

  return (
    <div hidden={!inProp} id={id} data-testid={dataTestId}>
      {children}
    </div>
  );
}

const mockCollapse = vi.fn(
  (props: CollapseProps & { "data-testid"?: string }) => (
    <MockCollapseImpl {...props} />
  ),
);

vi.mock("@mui/material/Fade", () => ({ default: mockFade }));
vi.mock("@mui/material/Collapse", () => ({ default: mockCollapse }));

beforeEach(() => {
  mockFade.mockClear();
  mockCollapse.mockClear();
});

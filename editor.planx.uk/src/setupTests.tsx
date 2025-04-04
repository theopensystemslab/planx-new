import "@testing-library/jest-dom";
import "vitest-axe/extend-expect";

import { FadeProps } from "@mui/material/Fade";
import server from "mockServer/server";
import React from "react";
import { vi } from "vitest";

/**
 * Mock the MUI Fade component used in @planx/components/shared/Preview/Card.tsx
 * Required as this frequently updates following the final "expect()" call of a test,
 * leading to multiple "an update was not wrapped in act(...)" warnings
 * Docs: https://testing-library.com/docs/example-react-transition-group/
 */
const mockFade = vi.fn(({ children }: FadeProps) => <div>{children}</div>);

vi.doMock("@mui/material/Fade", () => ({
  default: mockFade,
}));

beforeEach(() => {
  mockFade.mockClear();
});

beforeAll(() => server.listen());

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

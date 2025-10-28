import "@testing-library/jest-dom";
import "vitest-axe/extend-expect";
import "@testing-library/jest-dom/vitest";

import { FadeProps } from "@mui/material/Fade";
import React from "react";
import server from "test/mockServer";
import { vi } from "vitest";

// Polyfill for ProgressEvent - missing from JSDOM
if (typeof ProgressEvent === 'undefined') {
  global.ProgressEvent = class ProgressEvent extends Event {
    lengthComputable: boolean;
    loaded: number;
    total: number;

    constructor(type: string, eventInitDict: ProgressEventInit = {}) {
      super(type, eventInitDict);
      this.lengthComputable = eventInitDict.lengthComputable || false;
      this.loaded = eventInitDict.loaded || 0;
      this.total = eventInitDict.total || 0;
    }
  };
}

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

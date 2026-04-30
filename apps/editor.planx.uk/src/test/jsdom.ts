import { vi } from "vitest";

// jsdom does not implement window.scrollTo
Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true });

// jsdom requires the optional `canvas` package for HTMLCanvasElement.getContext.
// Mock it globally so tests that render canvas-containing components don't warn.
Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  value: vi.fn(),
  writable: true,
});

window.alert = vi.fn();

// Minimal indexedDB stub — enough to silence the error, tests don't actually use IDB
global.indexedDB = { open: vi.fn() } as any;

import { setupServer } from "msw/node";
import { vi } from "vitest";

const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: "bypass" });

  // Mock WebSocket to prevent GraphQL subscription errors in tests
  // that don't actually need WebSocket functionality
  Object.defineProperty(global, "WebSocket", {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      close: vi.fn(),
      send: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      readyState: 0,
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3,
    })),
  });

  // Mock ProgressEvent for MSW XMLHttpRequest interceptors
  if (typeof global.ProgressEvent === "undefined") {
    global.ProgressEvent = class ProgressEvent extends Event {
      constructor(type: string, init?: ProgressEventInit) {
        super(type, init);
      }
    } as any;
  }
});

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

export default server;

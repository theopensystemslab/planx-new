import { setupServer } from "msw/node";
import { vi } from "vitest";

// Mock ProgressEvent for MSW XMLHttpRequest interceptors
// This must be defined at module level, before MSW is initialized
if (typeof global.ProgressEvent === "undefined") {
  class ProgressEventPolyfill extends Event implements ProgressEvent {
    readonly lengthComputable: boolean;
    readonly loaded: number;
    readonly total: number;

    constructor(type: string, init?: ProgressEventInit) {
      super(type, init);
      this.lengthComputable = init?.lengthComputable ?? false;
      this.loaded = init?.loaded ?? 0;
      this.total = init?.total ?? 0;
    }
  }

  global.ProgressEvent = ProgressEventPolyfill as any;
}

const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: "bypass" });

  // Mock WebSocket to prevent GraphQL subscription errors in tests
  // that don't actually need WebSocket functionality
  Object.defineProperty(global, "WebSocket", {
    writable: true,
    value: vi.fn().mockImplementation(() => {
      const mockWs = {
        close: vi.fn(),
        send: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        readyState: 3, // CLOSED state to prevent connection attempts
        CONNECTING: 0,
        OPEN: 1,
        CLOSING: 2,
        CLOSED: 3,
        url: "",
        protocol: "",
        bufferedAmount: 0,
        extensions: "",
        binaryType: "blob" as BinaryType,
        onopen: null,
        onerror: null,
        onclose: null,
        onmessage: null,
        dispatchEvent: vi.fn(),
      };
      return mockWs;
    }),
  });
});

afterEach(() => server.resetHandlers());

afterAll(async () => {
  server.close();
  // Wait for the next tick to allow pending MSW promises to resolve
  // (e.g. bypasses / unhandled requests) before the environment
  // (window/URL) is destroyed
  await new Promise((resolve) => setImmediate(resolve));
});

export default server;

import { setupServer } from "msw/node";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));

afterEach(() => server.resetHandlers());

afterAll(async () => {
  server.close();
  // Wait for the next tick to allow pending MSW promises to resolve
  // (e.g. bypasses / unhandled requests) before the environment
  // (window/URL) is destroyed
  await new Promise((resolve) => setImmediate(resolve));
});

export default server;

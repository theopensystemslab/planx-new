import { setupServer } from "msw/node";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));

afterEach(() => {
  server.resetHandlers();

  // clear any pending timers
  vi.useRealTimers();
  vi.clearAllTimers();
});

afterAll(() => server.close());

export default server;

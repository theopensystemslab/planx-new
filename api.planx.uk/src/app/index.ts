// The middleware of an Express app is excecuted in sequence.
// This means that the order of `app.use(...)` statements is significant.
//
// This file exposes the express app after middlewar has been applied in a meaningful order:
//
//   1. init.ts - this sets up app configuration for all routes
//   2. cookieless - this adds routes that are available without cookies

import app from "./cookieless";

export default app;

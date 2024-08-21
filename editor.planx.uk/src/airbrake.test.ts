// import { Notifier } from "@airbrake/browser";
import { vi } from "vitest";

vi.mock("@airbrake/browser");

// describe("logger", () => {
//   const originalEnv = import.meta.env;
//   let logSpy: vi.SpyInstance;
//   let windowSpy: vi.SpyInstance;

//   beforeEach(() => {
//     process.env = originalEnv;
//     logSpy = vi.spyOn(console, "log").mockImplementation();
//     windowSpy = vi.spyOn(window, "window", "get");
//   });

//   afterEach(() => {
//     vi.resetModules();
//     (Notifier as any).mockRestore();
//     logSpy.mockRestore();
//     windowSpy.mockRestore();
//   });

//   afterAll(() => {
//     process.env = originalEnv;
//   });

//   test("Notifier is configured in a production-like environment", () => {
//     windowSpy.mockImplementation(() => ({
//       location: { host: "editor.planx.uk" },
//     }));
//     process.env = Object.assign({
//       VITE_APP_ENV: "production",
//       VITE_APP_AIRBRAKE_PROJECT_ID: "1",
//       VITE_APP_AIRBRAKE_PROJECT_KEY: "a",
//     });
//     // instantiate the logger after mocks and env variables set
//     const { logger } = require("./airbrake");
//     expect(Notifier).toHaveBeenCalledWith({
//       projectId: 1,
//       projectKey: "a",
//       environment: "production",
//     });
//     logger.notify({ some: "value" });
//     expect(Notifier.prototype.notify).toHaveBeenCalledWith({
//       some: "value",
//     });
//   });

//   test("Notifier is not configured for development environments", () => {
//     // instantiate the logger after env variables set
//     const { logger } = require("./airbrake");
//     expect(Notifier).not.toHaveBeenCalled();
//     logger.notify({ some: "value" });
//     expect(logSpy).toHaveBeenCalledWith({ some: "value" });
//   });

//   test("logs are suppressed when SUPPRESS_LOGS is set", () => {
//     process.env = Object.assign({
//       SUPPRESS_LOGS: "true",
//     });
//     // instantiate the logger after env variables set
//     const { logger } = require("./airbrake");
//     expect(Notifier).not.toHaveBeenCalled();
//     logger.notify({ some: "value" });
//     expect(logSpy).not.toHaveBeenCalledWith({ some: "value" });
//   });
// });

import { describe, vi } from "vitest";

vi.mock("ai", () => ({
  createGateway: vi.fn(),
  NoSuchModelError: {
    isInstance: vi.fn(),
  },
}));

describe.todo("getModel - unit tests");

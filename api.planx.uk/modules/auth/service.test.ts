import { checkUserCanAccessEnv } from "./service";

const mockIsStagingOnly = jest.fn();

jest.mock("../../client", () => {
  return {
    $api: {
      user: {
        isStagingOnly: () => mockIsStagingOnly(),
      },
    },
  };
});

describe("canUserAccessEnv() helper function", () => {
  describe("a staging-only user", () => {
    beforeAll(() => mockIsStagingOnly.mockResolvedValue(true));

    test("can't access production", async () => {
      const result = await checkUserCanAccessEnv(
        "test@example.com",
        "production",
      );
      expect(result).toBe(false);
    });

    test("can access staging", async () => {
      const result = await checkUserCanAccessEnv("test@example.com", "staging");
      expect(result).toBe(true);
    });

    test("can access pizzas", async () => {
      const result = await checkUserCanAccessEnv("test@example.com", "pizza");
      expect(result).toBe(true);
    });

    test("can access test envs", async () => {
      const result = await checkUserCanAccessEnv("test@example.com", "test");
      expect(result).toBe(true);
    });
  });

  describe("a non staging-only user", () => {
    beforeAll(() => mockIsStagingOnly.mockResolvedValue(false));

    test("can access production", async () => {
      const result = await checkUserCanAccessEnv(
        "test@example.com",
        "production",
      );
      expect(result).toBe(true);
    });

    test("can access staging", async () => {
      const result = await checkUserCanAccessEnv("test@example.com", "staging");
      expect(result).toBe(true);
    });

    test("can access pizzas", async () => {
      const result = await checkUserCanAccessEnv("test@example.com", "pizza");
      expect(result).toBe(true);
    });

    test("can access test envs", async () => {
      const result = await checkUserCanAccessEnv("test@example.com", "test");
      expect(result).toBe(true);
    });
  });
});

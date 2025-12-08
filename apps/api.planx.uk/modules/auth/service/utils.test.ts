import type { User } from "@opensystemslab/planx-core/types";
import { checkUserCanAccessEnv } from "./utils.js";

const mockIsStagingOnly = vi.fn();

const mockUser: User = {
  firstName: "Bilbo",
  lastName: "Baggins",
  id: 123,
  email: "test@example.com",
  isPlatformAdmin: false,
  isAnalyst: false,
  defaultTeamId: null,
  teams: [],
};

vi.mock("../../../client", () => {
  return {
    $admin: {
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
      const result = await checkUserCanAccessEnv(mockUser, "production");
      expect(result).toBe(false);
    });

    test("can access staging", async () => {
      const result = await checkUserCanAccessEnv(mockUser, "staging");
      expect(result).toBe(true);
    });

    test("can access pizzas", async () => {
      const result = await checkUserCanAccessEnv(mockUser, "pizza");
      expect(result).toBe(true);
    });

    test("can access test envs", async () => {
      const result = await checkUserCanAccessEnv(mockUser, "test");
      expect(result).toBe(true);
    });
  });

  describe("a non staging-only user", () => {
    beforeAll(() => mockIsStagingOnly.mockResolvedValue(false));

    test("can access production", async () => {
      const result = await checkUserCanAccessEnv(mockUser, "production");
      expect(result).toBe(true);
    });

    test("can access staging", async () => {
      const result = await checkUserCanAccessEnv(mockUser, "staging");
      expect(result).toBe(true);
    });

    test("can access pizzas", async () => {
      const result = await checkUserCanAccessEnv(mockUser, "pizza");
      expect(result).toBe(true);
    });

    test("can access test envs", async () => {
      const result = await checkUserCanAccessEnv(mockUser, "test");
      expect(result).toBe(true);
    });
  });

  describe("a demo user", () => {
    beforeAll(() => {
      mockIsStagingOnly.mockResolvedValue(false);
      mockUser.teams.push({
        role: "demoUser",
        team: {
          name: "Demo",
          slug: "demo",
          id: 123,
        },
      });
    });

    test("can't access production", async () => {
      const result = await checkUserCanAccessEnv(mockUser, "production");
      expect(result).toBe(false);
    });

    test("can access staging", async () => {
      const result = await checkUserCanAccessEnv(mockUser, "staging");
      expect(result).toBe(true);
    });

    test("can access pizzas", async () => {
      const result = await checkUserCanAccessEnv(mockUser, "pizza");
      expect(result).toBe(true);
    });

    test("can access test envs", async () => {
      const result = await checkUserCanAccessEnv(mockUser, "test");
      expect(result).toBe(true);
    });
  });
});

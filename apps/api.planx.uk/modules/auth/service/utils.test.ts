import type { User } from "@opensystemslab/planx-core/types";

import { checkUserCanAccessEnv, isValidRedirect } from "./utils.js";

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

describe("isValidRedirect() helper function", () => {
  describe("valid domains", () => {
    it("accepts production editor URLs", () => {
      expect(isValidRedirect("https://editor.planx.uk")).toBe(true);
      expect(isValidRedirect("https://editor.planx.uk/app")).toBe(true);
    });

    it("accepts staging editor URL", () => {
      expect(isValidRedirect("https://editor.planx.dev")).toBe(true);
      expect(isValidRedirect("https://editor.planx.dev/some/path")).toBe(true);
    });

    it("accepts pizza URLs with 4-5 digit PR numbers", () => {
      expect(isValidRedirect("https://1234.planx.pizza")).toBe(true);
      expect(isValidRedirect("https://12345.planx.pizza")).toBe(true);
      expect(isValidRedirect("https://9999.planx.pizza/app")).toBe(true);
    });

    it("accepts localhost dev URL", () => {
      expect(isValidRedirect("http://localhost:3000")).toBe(true);
      expect(isValidRedirect("http://localhost:3000/app/some/path")).toBe(true);
    });
  });

  describe("invalid domains", () => {
    it("rejects arbitrary external URLs", () => {
      expect(isValidRedirect("https://evil.com")).toBe(false);
      expect(isValidRedirect("https://attacker.example.org")).toBe(false);
    });

    it("rejects URLs attempting to spoof planx domains, e.g. typo squatting", () => {
      expect(isValidRedirect("https://editor.plannx.uk")).toBe(false);
      expect(isValidRedirect("https://subdomain.editor.planx.uk")).toBe(false);
      expect(isValidRedirect("https://editorr.planx.uk")).toBe(false);
    });

    it("rejects planx.pizza without a valid PR number", () => {
      expect(isValidRedirect("https://planx.pizza")).toBe(false);
      expect(isValidRedirect("https://abc.planx.pizza")).toBe(false);
      expect(isValidRedirect("https://123.planx.pizza")).toBe(false);
      expect(isValidRedirect("https://123456.planx.pizza")).toBe(false);
    });

    it("rejects localhost on any other port", () => {
      expect(isValidRedirect("http://localhost:8080")).toBe(false);
      expect(isValidRedirect("http://localhost:9000")).toBe(false);
    });

    it("rejects https localhost (must be http)", () => {
      expect(isValidRedirect("https://localhost:3000")).toBe(false);
    });

    it("rejects malformed URLs", () => {
      expect(isValidRedirect("not-a-url")).toBe(false);
      expect(isValidRedirect("")).toBe(false);
    });

    it("rejects javascript: protocol", () => {
      expect(isValidRedirect("javascript:alert(1)")).toBe(false);
    });
  });
});

import { getTestJWT } from "../../tests/mockJWT.js";
import { userContext } from "../auth/middleware.js";

import {
  getUserAndTeam,
  addMember,
  removeMember,
  changeMemberRole,
} from "./service.js";

const getStoreMock = vi.spyOn(userContext, "getStore");

const mockTeam = { id: 123 };
const mockUser = { id: 456 };

const mockAddMember = vi.fn();
const mockRemoveMember = vi.fn();
const mockChangeMemberRole = vi.fn();
const mockGetTeamBySlug = vi.fn().mockResolvedValue(mockTeam);
const mockGetUserByEmail = vi.fn().mockResolvedValue(mockUser);

vi.mock("@opensystemslab/planx-core", () => {
  return {
    CoreDomainClient: class MockCoreDomainClient {
      team = {
        getBySlug: () => mockGetTeamBySlug(),
        addMember: () => mockAddMember(),
        removeMember: () => mockRemoveMember(),
        changeMemberRole: () => mockChangeMemberRole(),
      };
      user = {
        getByEmail: () => mockGetUserByEmail(),
      };
    },
  };
});

describe("TeamService", () => {
  beforeEach(() => {
    getStoreMock.mockReturnValue({
      user: {
        sub: "123",
        jwt: getTestJWT({ role: "teamEditor" }),
      },
    });
  });

  describe("getUserAndTeam helper", () => {
    it("handles invalid teamSlugs", async () => {
      mockGetTeamBySlug.mockResolvedValueOnce(null);
      await expect(() =>
        getUserAndTeam({
          userEmail: "newbie@council.gov",
          teamSlug: "not-a-team",
        }),
      ).rejects.toThrow();
    });

    it("handles invalid emails", async () => {
      mockGetUserByEmail.mockResolvedValueOnce(null);
      await expect(() =>
        getUserAndTeam({
          userEmail: "invalid-email@council.gov",
          teamSlug: "a-real-team",
        }),
      ).rejects.toThrow();
    });
  });

  describe("addMember", () => {
    it("handles Hasura failures", async () => {
      mockAddMember.mockResolvedValueOnce(false);
      await expect(() =>
        addMember({
          userEmail: "newbie@council.gov",
          role: "teamEditor",
          teamSlug: "a-real-team",
        }),
      ).rejects.toThrow();
    });
  });

  describe("removeMember", () => {
    it("handles Hasura failures", async () => {
      mockRemoveMember.mockResolvedValueOnce(false);
      await expect(() =>
        removeMember({
          userEmail: "newbie@council.gov",
          teamSlug: "a-real-team",
        }),
      ).rejects.toThrow();
    });
  });

  describe("changeMemberRole", () => {
    it("handles Hasura failures", async () => {
      mockChangeMemberRole.mockResolvedValueOnce(false);
      await expect(() =>
        changeMemberRole({
          userEmail: "newbie@council.gov",
          role: "teamEditor",
          teamSlug: "a-real-team",
        }),
      ).rejects.toThrow();
    });
  });
});

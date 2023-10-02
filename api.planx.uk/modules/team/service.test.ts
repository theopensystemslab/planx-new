import { getJWT } from "../../tests/mockJWT";
import { userContext } from "../auth/middleware";

import {
  getUserAndTeam,
  addMember,
  removeMember,
  changeMemberRole,
} from "./service";

const getStoreMock = jest.spyOn(userContext, "getStore");

const mockTeam = { id: 123 };
const mockUser = { id: 456 };

const mockAddMember = jest.fn();
const mockRemoveMember = jest.fn();
const mockChangeMemberRole = jest.fn();
const mockGetTeamBySlug = jest.fn().mockResolvedValue(mockTeam);
const mockGetUserByEmail = jest.fn().mockResolvedValue(mockUser);

jest.mock("@opensystemslab/planx-core", () => {
  return {
    CoreDomainClient: jest.fn().mockImplementation(() => ({
      team: {
        getBySlug: () => mockGetTeamBySlug(),
        addMember: () => mockAddMember(),
        removeMember: () => mockRemoveMember(),
        changeMemberRole: () => mockChangeMemberRole(),
      },
      user: {
        getByEmail: () => mockGetUserByEmail(),
      },
    })),
  };
});

describe("TeamService", () => {
  beforeEach(() => {
    getStoreMock.mockReturnValue({
      user: {
        sub: "123",
        jwt: getJWT({ role: "teamEditor" }),
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

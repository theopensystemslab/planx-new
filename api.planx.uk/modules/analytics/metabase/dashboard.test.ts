import { findDashboardPublicLink } from "./findDashboardPublicLink.js";
import { getTeamSlug } from "./getTeamSlug.js";
import { filterPublicLink } from "./filterPublicLink.js";
import { updatePublicAnalyticsLink } from "./updatePublicAnalyticsLink.js";
import nock from "nock";

describe("Metabase dashboard link module", () => {
  describe("findDashboardPublicLink", () => {
    test("returns correct public link for a valid service slug", () => {
      const serviceSlugFOI = "find-out-if-you-need-planning-permission";
      const serviceSlugCIY = "check-if-you-need-planning-permission";
      const linkFOI = findDashboardPublicLink(serviceSlugFOI);
      const linkCIY = findDashboardPublicLink(serviceSlugCIY);
      const publicLinkFOI =
        "https://metabase.editor.planx.dev/public/dashboard/d6303f0b-d6e8-4169-93c0-f988a93e19bc?service_slug={service-slug}&team_slug={team-slug}";
      expect(linkFOI).toBe(publicLinkFOI);
      expect(linkCIY).toBe(publicLinkFOI);
    });

    test("returns correct public link for a range of submission services", () => {
      const serviceSlugAFPP = "apply-for-planning-permission";
      const serviceSlugLDC = "apply-for-a-lawful-development-certificate";
      const serviceSlugPreApp = "apply-for-pre-application-advice";

      const linkAFPP = findDashboardPublicLink(serviceSlugAFPP);
      const linkLDC = findDashboardPublicLink(serviceSlugLDC);
      const linkPreApp = findDashboardPublicLink(serviceSlugPreApp);

      const publicLinkSubmission =
        "https://metabase.editor.planx.dev/public/dashboard/363fd552-8c2b-40d9-8b7a-21634ec182cc?service_slug={service-slug}&team_slug={team-slug}";
      expect(linkAFPP).toBe(publicLinkSubmission);
      expect(linkLDC).toBe(publicLinkSubmission);
      expect(linkPreApp).toBe(publicLinkSubmission);
    });

    test("returns null for an invalid service slug", () => {
      const serviceSlug = "invalid-slug";
      const link = findDashboardPublicLink(serviceSlug);
      expect(link).toBeNull();
    });
  });

  describe("getTeamSlug", () => {
    test("fetches team slug for a valid team ID", async () => {
      const mockResponse = {
        data: { teams: [{ id: 1, teamSlug: "team-slug" }] },
      };
      nock("http://localhost").post("/graphql").reply(200, mockResponse);

      const result = await getTeamSlug(1);
      expect(result.teamSlug).toBe("team-slug");
    });

    test("throws an error for an invalid team ID", async () => {
      nock("http://localhost")
        .post("/graphql")
        .reply(400, { errors: [{ message: "Error" }] });

      await expect(getTeamSlug(999)).rejects.toThrow("Error");
    });
  });

  describe("filterPublicLink", () => {
    test("replaces placeholders in the public link", async () => {
      const publicLink = "https://test.com/{team-slug}/{service-slug}";
      const teamSlug = "team-slug";
      const serviceSlug = "service-slug";

      const result = await filterPublicLink(publicLink, serviceSlug, teamSlug);
      expect(result).toBe("https://test.com/team-slug/service-slug");
    });
  });

  describe("updatePublicAnalyticsLink", () => {
    test("updates analytics link for a valid flow ID", async () => {
      const mockResponse = {
        data: {
          flow: { id: "flow-id", analytics_link: "https://test.com" },
        },
      };
      nock("http://localhost").post("/graphql").reply(200, mockResponse);

      const result = await updatePublicAnalyticsLink(
        "flow-id",
        "https://test.com",
      );
      expect(result.flow.id).toBe("flow-id");
      expect(result.flow.publicLink).toBe("https://test.com");
    });

    test("throws an error for an invalid flow ID", async () => {
      nock("http://localhost")
        .post("/graphql")
        .reply(400, { errors: [{ message: "Error" }] });

      await expect(
        updatePublicAnalyticsLink("invalid-id", "https://test.com"),
      ).rejects.toThrow("Error");
    });
  });
});

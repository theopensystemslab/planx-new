import { findDashboardPublicLink } from "./findDashboardPublicLink.js";
import { getTeamSlug } from "./getTeamSlug.js";
import { filterPublicLink } from "./filterPublicLink.js";
import { updatePublicAnalyticsLink } from "./updatePublicAnalyticsLink.js";
import { $api } from "../../../client/index.js";

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
  });

  describe("getTeamSlug", () => {
    test("fetches team slug for a valid team ID", async () => {
      // Mock API response
      vi.spyOn($api.client, "request").mockResolvedValueOnce({
        teams: [{ id: 1, teamSlug: "team-slug" }],
      });

      const result = await getTeamSlug(1);
      expect(result.teamSlug).toBe("team-slug");
    });

    test("throws an error for an invalid team ID", async () => {
      // Mock API error response
      vi.spyOn($api.client, "request").mockRejectedValueOnce(
        new Error("Error"),
      );

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
      // Mock API response
      vi.spyOn($api.client, "request").mockResolvedValueOnce({
        flow: { id: "flow-id", publicLink: "https://test.com" },
      });

      const result = await updatePublicAnalyticsLink(
        "flow-id",
        "https://test.com",
      );
      console.log({ result });
      expect(result.flow.id).toBe("flow-id");
      expect(result.flow.publicLink).toBe("https://test.com");
    });

    test("throws an error for an invalid flow ID", async () => {
      // Mock API error response
      vi.spyOn($api.client, "request").mockRejectedValueOnce(
        new Error("Error"),
      );

      await expect(
        updatePublicAnalyticsLink("invalid-id", "https://test.com"),
      ).rejects.toThrow("Error");
    });
  });
});

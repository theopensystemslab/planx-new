import { generateDashboardLink } from "./generateDashboardLink.js";
import { updatePublicAnalyticsLink } from "./updatePublicAnalyticsLink.js";
import { $api } from "../../../client/index.js";

describe("Metabase dashboard link module", () => {
  describe("generateDashboardLink", () => {
    test("returns correct public link for a valid service slug", () => {
      const serviceSlug = "find-out-if-you-need-planning-permission";
      const flowId = "aaaa-bbbb-cccc-dddd";
      const linkFOI = generateDashboardLink({
        environment: "staging",
        serviceSlug,
        flowId,
      });
      const publicLink =
        "https://metabase.editor.planx.dev/public/dashboard/d6303f0b-d6e8-4169-93c0-f988a93e19bc?flow_id=aaaa-bbbb-cccc-dddd";
      expect(linkFOI).toBe(publicLink);
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

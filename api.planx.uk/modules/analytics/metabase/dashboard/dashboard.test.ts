import nock from "nock";
import { copyDashboard } from "./copyDashboard.js";
import { getDashboard } from "./getDashboard.js";
import { generatePublicLinkWithFilters } from "./generatePublicLinkWithFilters.js";

const BASE_URL = process.env.METABASE_URL_EXT;

const params = {
  name: "Template - Test Dashboard",
  templateId: 7,
  description: "Here is a description.",
  collectionId: 4,
  collectionPosition: 2,
};

describe("Dashboard Operations", () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  describe("getDashboard", () => {
    test("gets dashboard name from Metabase", async () => {
      const dashboardId = 7;
      const metabaseMock = nock(BASE_URL!)
        .get(`/api/dashboard/${dashboardId}`)
        .reply(200, {
          name: "Template - Test Dashboard",
        });

      const dashboard = await getDashboard(dashboardId);
      expect(dashboard.name).toBe("Template - Test Dashboard");
      expect(metabaseMock.isDone()).toBe(true);
    });
  });

  describe("copyDashboard", () => {
    test("copies dashboard template", async () => {
      const metabaseMock = nock(BASE_URL!)
        .post("/api/dashboard/7/copy", {
          name: params.name,
          description: params.description,
          collection_id: params.collectionId,
        })
        .reply(200, {
          id: 42,
          name: params.name,
          description: params.description,
        });

      const dashboard = await copyDashboard(params);

      expect(dashboard).toBe(42);
      expect(metabaseMock.isDone()).toBe(true);
    });

    test("places new dashboard into correct parent", async () => {
      const metabasePostMock = nock(BASE_URL!)
        .post("/api/dashboard/7/copy", {
          name: params.name,
          description: params.description,
          collection_id: params.collectionId,
        })
        .reply(200, {
          id: 42,
          name: params.name,
          collectionId: 4,
          description: params.description,
        });

      const metabaseGetMock = nock(BASE_URL!)
        .get("/api/dashboard/42")
        .reply(200, {
          name: params.name,
          id: 42,
          collection_id: 4,
        });

      const newDashboardId = await copyDashboard(params);
      const checkDashboard = await getDashboard(newDashboardId);

      expect(checkDashboard.collectionId).toBe(4);
      expect(metabasePostMock.isDone()).toBe(true);
      expect(metabaseGetMock.isDone()).toBe(true);
    });
  });

  describe("generatePublicLinkWithFilters", () => {
    test("generates public link", async () => {
      const dashboardId = 8;
      const testUuid = 1111111;
      const teamSlug = "council-slug"
      const serviceSlug = "find-out-if"

      nock(BASE_URL!)
        .post(`/api/dashboard/${dashboardId}/public_link`)
        .reply(200, {
          uuid: testUuid,
        });

      const link = await generatePublicLinkWithFilters(dashboardId, serviceSlug, teamSlug);
      expect(link).toBe(`${BASE_URL}/public/dashboard/${testUuid}?service_slug=${serviceSlug}&team_slug=${teamSlug}`);
    });
  });
});

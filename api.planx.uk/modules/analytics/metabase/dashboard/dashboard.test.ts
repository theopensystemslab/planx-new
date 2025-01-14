import nock from "nock";
import { copyDashboard } from "./copyDashboard.js";
import { getDashboard } from "./getDashboard.js";
import { updateFilter } from "./updateFilter.js";
import { toMetabaseParams } from "./types.js";
import { generatePublicLink } from "./generatePublicLink.js";

describe("Dashboard Operations", () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  describe("getDashboard", () => {
    test("gets dashboard name from Metabase", async () => {
      const dashboardId = 7;
      const metabaseMock = nock(process.env.METABASE_URL_EXT!)
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
      const params = {
        name: "Template - Test Dashboard",
        templateId: 7,
        description: "Here is a description.",
        collectionId: 4,
        isDeepCopy: false,
      };

      const metabaseMock = nock(process.env.METABASE_URL_EXT!)
        .post("/api/dashboard/7/copy", {
          name: params.name,
          description: params.description,
          collection_id: params.collectionId,
          is_deep_copy: params.isDeepCopy,
        })
        .reply(200, {
          id: 42,
          name: params.name,
          description: params.description,
        });

      const dashboard = await copyDashboard({
        name: "Template - Test Dashboard",
        templateId: 7,
        description: "Here is a description.",
        collectionId: 4,
      });

      expect(dashboard).toBe(42);
      expect(metabaseMock.isDone()).toBe(true);
    });

    test("copies and renames dashboard", async () => {
      const params = {
        name: "New Dashboard Name",
        templateId: 7,
        description: "New dashboard description",
        collectionId: 4,
        isDeepCopy: false,
      };

      const metabaseMock = nock(process.env.METABASE_URL_EXT!)
        .post("/api/dashboard/7/copy", {
          name: params.name,
          description: params.description,
          collection_id: params.collectionId,
          is_deep_copy: params.isDeepCopy,
        })
        .reply(200, {
          id: 43,
          name: params.name,
          description: params.description,
        });

      const dashboard = await copyDashboard(params);
      expect(dashboard).toBe(43);
      expect(metabaseMock.isDone()).toBe(true);
    });

    test("transforms params to snake case for Metabase API", async () => {
      const params = {
        name: "Barnet",
        templateId: 88,
        collectionId: 4,
        collectionPosition: 2,
      };

      const snakeCaseParams = toMetabaseParams(params);
      expect(snakeCaseParams).toHaveProperty("collection_id");
      expect(snakeCaseParams.collection_id).toBe(4);
      expect(snakeCaseParams).toHaveProperty("collection_position");
      expect(snakeCaseParams.collection_position).toBe(2);
    });

    test("places new dashboard into correct parent", async () => {
      const params = {
        name: "Template - Test Dashboard",
        templateId: 7,
        description: "Here is a description.",
        collectionId: 4,
        isDeepCopy: false,
      };

      const metabasePostMock = nock(process.env.METABASE_URL_EXT!)
        .post("/api/dashboard/7/copy", {
          name: params.name,
          description: params.description,
          collection_id: params.collectionId,
          is_deep_copy: params.isDeepCopy,
        })
        .reply(200, {
          id: 42,
          name: params.name,
          collectionId: 4,
          description: params.description,
        });

      const metabaseGetMock = nock(process.env.METABASE_URL_EXT!)
        .get("/api/dashboard/42")
        .reply(200, {
          name: params.name,
          id: 42,
          collection_id: 4,
        });

      const newDashboardId = await copyDashboard(params);
      const checkDashboard = await getDashboard(newDashboardId);

      expect(checkDashboard.collection_id).toBe(4);
      expect(metabasePostMock.isDone()).toBe(true);
      expect(metabaseGetMock.isDone()).toBe(true);
    });
  });

  describe("updateFilter", () => {
    const dashboardId = 123;
    const filterName = "test_filter";
    const filterValue = "new_value";

    test("successfully updates string filter value", async () => {
      nock(process.env.METABASE_URL_EXT!)
        .get(`/api/dashboard/${dashboardId}`)
        .reply(200, {
          parameters: [
            {
              name: filterName,
              type: "string/=",
              default: ["old_value"],
            },
          ],
        });

      nock(process.env.METABASE_URL_EXT!)
        .put(`/api/dashboard/${dashboardId}`, {
          parameters: [
            {
              name: filterName,
              type: "string/=",
              default: [filterValue],
            },
          ],
        })
        .reply(200, {
          parameters: [
            {
              name: filterName,
              type: "string/=",
              default: [filterValue],
            },
          ],
          param_fields: {},
        });

      await expect(
        updateFilter({
          dashboardId: dashboardId,
          filter: filterName,
          value: filterValue,
        }),
      ).resolves.not.toThrow();
    });

    test("handles non-string filter type appropriately", async () => {
      nock(process.env.METABASE_URL_EXT!)
        .get(`/api/dashboard/${dashboardId}`)
        .reply(200, {
          parameters: [
            {
              name: filterName,
              slug: "event",
              id: "30a24538",
              type: "number/=",
              sectionId: "number",
              default: [42],
            },
          ],
        });

      nock(process.env.METABASE_URL_EXT!)
        .put(`/api/dashboard/${dashboardId}`)
        .reply(400, {
          message: "Invalid parameter type. Expected number, got string.",
        });

      await expect(
        updateFilter({
          dashboardId: dashboardId,
          filter: filterName,
          value: "not_a_number",
        }),
      ).rejects.toThrow(
        "Filter type 'number/=' is not supported. Only string filters are currently supported.",
      );
    });
  });

  describe("generatePublicLink", () => {
    test("generates public link", async () => {
      const dashboardId = 8;
      const testUuid = 1111111;

      nock(process.env.METABASE_URL_EXT!)
        .post(`/api/dashboard/${dashboardId}/public_link`)
        .reply(200, {
          uuid: testUuid,
        });

      const link = await generatePublicLink(dashboardId);
      expect(link).toBe(
        `${process.env.METABASE_URL_EXT}/public/dashboard/${testUuid}`,
      );
    });
  });
});

import assert from "node:assert";

import { gqlAdmin, introspectAs } from "./utils.js";

describe("searchable_flows", () => {
  describe("permissions", () => {
    test.each(["teamEditor", "teamAdmin", "platformAdmin"])(
      "%s role can query searchable_flows directly",
      async (role) => {
        const i = await introspectAs(role);
        expect(i.queries).toContain("searchable_flows");
      },
    );

    test.each(["public", "analyst", "teamViewer"])(
      "%s role cannot query searchable_flows",
      async (role) => {
        const i = await introspectAs(role);
        expect(i.queries).not.toContain("searchable_flows");
      },
    );

    test("only exposes the columns search needs, not the rest of flows (e.g. data)", async () => {
      const i = await introspectAs("teamEditor");
      const type = i.types.find((t) => t.name === "searchable_flows");
      const fieldNames = type.fields.map((f) => f.name);

      expect(fieldNames).not.toContain("data");
      expect(fieldNames).toEqual(
        expect.arrayContaining([
          "id",
          "name",
          "slug",
          "description",
          "status",
          "is_template",
          "can_create_from_copy",
          "templated_from",
          "team_id",
          "team",
        ]),
      );
    });
  });

  describe("behaviour", () => {
    let liveId;
    let deletedId;

    beforeAll(async () => {
      const res = await gqlAdmin(`
        mutation {
          live: insert_flows_one(object: {
            slug: "TEST_searchable_flows_live"
            name: "Test searchable_flows live"
            data: {}
          }) { id }
          deleted: insert_flows_one(object: {
            slug: "TEST_searchable_flows_deleted"
            name: "Test searchable_flows deleted"
            data: {}
            deleted_at: "now()"
          }) { id }
        }
      `);
      assert.ok(!res.errors, JSON.stringify(res.errors));
      liveId = res.data.live.id;
      deletedId = res.data.deleted.id;
    });

    afterAll(async () => {
      await gqlAdmin(`
        mutation { delete_flows(where: {id: {_in: ${JSON.stringify([liveId, deletedId])}}}) { affected_rows } }
      `);
    });

    test("excludes soft-deleted flows", async () => {
      const res = await gqlAdmin(`
        query {
          searchable_flows(where: {id: {_in: ${JSON.stringify([liveId, deletedId])}}}) {
            id
          }
        }
      `);
      assert.ok(!res.errors, JSON.stringify(res.errors));
      expect(res.data.searchable_flows.map((f) => f.id)).toEqual([liveId]);
    });
  });
});

import assert from "node:assert";

import { gqlAdmin, introspectAs } from "./utils.js";

describe("search_flows", () => {
  describe("permissions", () => {
    test.each(["teamEditor", "teamAdmin", "platformAdmin"])(
      "%s role can call search_flows as a query",
      async (role) => {
        const i = await introspectAs(role);
        expect(i.queries).toContain("search_flows");
      },
    );

    test.each(["public", "analyst", "teamViewer"])(
      "%s role cannot call search_flows",
      async (role) => {
        const i = await introspectAs(role);
        expect(i.queries).not.toContain("search_flows");
      },
    );
  });

  describe("behaviour", () => {
    let closeMatchId;
    let partialMatchId;
    let unrelatedId;
    let deletedId;
    let templateId;

    const flowIds = () =>
      [closeMatchId, partialMatchId, unrelatedId, deletedId, templateId].filter(
        Boolean,
      );

    beforeAll(async () => {
      const res = await gqlAdmin(`
        mutation {
          closeMatch: insert_flows_one(object: {
            slug: "TEST_search_flows_close_match"
            name: "Apply for planning permission"
            data: {}
          }) { id }
          partialMatch: insert_flows_one(object: {
            slug: "TEST_search_flows_partial_match"
            name: "Report a planning permission breach"
            data: {}
          }) { id }
          unrelated: insert_flows_one(object: {
            slug: "TEST_search_flows_unrelated"
            name: "Some unrelated information"
            data: {}
          }) { id }
          deleted: insert_flows_one(object: {
            slug: "TEST_search_flows_deleted"
            name: "Apply for planning permission (deleted)"
            data: {}
            deleted_at: "now()"
          }) { id }
          template: insert_flows_one(object: {
            slug: "TEST_search_flows_template"
            name: "Apply for planning permission (template)"
            data: {}
            is_template: true
          }) { id }
        }
      `);
      assert.ok(!res.errors, JSON.stringify(res.errors));
      closeMatchId = res.data.closeMatch.id;
      partialMatchId = res.data.partialMatch.id;
      unrelatedId = res.data.unrelated.id;
      deletedId = res.data.deleted.id;
      templateId = res.data.template.id;
    });

    afterAll(async () => {
      await gqlAdmin(`
        mutation { delete_flows(where: {id: {_in: ${JSON.stringify(flowIds())}}}) { affected_rows } }
      `);
    });

    test("ranks close matches above partial matches, and excludes unrelated names", async () => {
      const res = await gqlAdmin(`
        query {
          search_flows(args: {search: "plannning permision"}, where: {id: {_in: ${JSON.stringify(
            [closeMatchId, partialMatchId, unrelatedId],
          )}}}) {
            id
          }
        }
      `);
      assert.ok(!res.errors, JSON.stringify(res.errors));
      const ids = res.data.search_flows.map((f) => f.id);

      expect(ids).toEqual([closeMatchId, partialMatchId]);
    });

    test("excludes soft-deleted flows even when the name matches closely", async () => {
      const res = await gqlAdmin(`
        query {
          search_flows(args: {search: "planning permission"}, where: {id: {_eq: "${deletedId}"}}) {
            id
          }
        }
      `);
      assert.ok(!res.errors, JSON.stringify(res.errors));
      expect(res.data.search_flows).toHaveLength(0);
    });

    test("accepts a where filter on top of the ranked results (e.g. is_template)", async () => {
      const candidateIds = [closeMatchId, templateId];

      const templatesOnly = await gqlAdmin(`
        query {
          search_flows(args: {search: "planning permission"}, where: {
            id: {_in: ${JSON.stringify(candidateIds)}}
            is_template: {_eq: true}
          }) { id }
        }
      `);
      assert.ok(!templatesOnly.errors, JSON.stringify(templatesOnly.errors));
      expect(templatesOnly.data.search_flows.map((f) => f.id)).toEqual([
        templateId,
      ]);

      const nonTemplatesOnly = await gqlAdmin(`
        query {
          search_flows(args: {search: "planning permission"}, where: {
            id: {_in: ${JSON.stringify(candidateIds)}}
            is_template: {_eq: false}
          }) { id }
        }
      `);
      assert.ok(
        !nonTemplatesOnly.errors,
        JSON.stringify(nonTemplatesOnly.errors),
      );
      expect(nonTemplatesOnly.data.search_flows.map((f) => f.id)).toEqual([
        closeMatchId,
      ]);
    });
  });
});

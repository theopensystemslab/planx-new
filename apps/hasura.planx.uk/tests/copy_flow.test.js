import assert from "node:assert";

import { gqlAdmin, introspectAs } from "./utils.js";

// mirrors rename_node_id() in the copy_flow SQL migration / renameNodeId() in helpers.ts
const renameNodeId = (nodeId, replaceValue) =>
  nodeId.slice(0, -replaceValue.length) + replaceValue;

describe("copy_flow", () => {
  describe("permissions", () => {
    test("api role can call copy_flow as a mutation", async () => {
      const i = await introspectAs("api");
      expect(i.mutations).toContain("copy_flow");
    });

    test.each(["public", "teamEditor", "teamAdmin", "platformAdmin"])(
      "%s role cannot call copy_flow",
      async (role) => {
        const i = await introspectAs(role);
        expect(i.mutations).not.toContain("copy_flow");
      },
    );
  });

  describe("behaviour", () => {
    const replaceValue = "XXXXX";
    let userId;
    let sourceFlowId;
    let newFlowId;

    beforeAll(async () => {
      const userRes = await gqlAdmin(`
        mutation {
          insert_users_one(object: {
            first_name: "Test"
            last_name: "CopyFlow"
            email: "copy-flow-test-user@example.com"
          }) { id }
        }
      `);
      userId = userRes.data.insert_users_one.id;

      const flowRes = await gqlAdmin(`
        mutation {
          insert_flows_one(object: {
            slug: "TEST_copy_flow_source"
            name: "Test copy_flow source"
            data: { _root: { edges: ["soloNode", "cloneNode"] } }
          }) { id }
        }
      `);
      sourceFlowId = flowRes.data.insert_flows_one.id;

      const contentRes = await gqlAdmin(
        `
        mutation Insert($userId: Int!) {
          solo: insert_flow_note_content_one(object: { text: "Solo note", color: "#fffdb0", created_by: $userId, updated_by: $userId }) { id }
          clone: insert_flow_note_content_one(object: { text: "Cloned note", color: "#ffd6a5", created_by: $userId, updated_by: $userId }) { id }
        }
        `,
        { userId },
      );
      const soloNoteId = contentRes.data.solo.id;
      const cloneNoteId = contentRes.data.clone.id;

      await gqlAdmin(
        `
        mutation Insert($flowId: uuid!, $userId: Int!, $soloNoteId: uuid!, $cloneNoteId: uuid!) {
          insert_flow_note_positions(objects: [
            { flow_id: $flowId, note_id: $soloNoteId, node_id: "soloNode", created_by: $userId }
            { flow_id: $flowId, note_id: $cloneNoteId, placement: { parent: "_root", before: "beforeNode" }, created_by: $userId }
            { flow_id: $flowId, note_id: $cloneNoteId, node_id: "cloneNode", created_by: $userId }
          ]) { affected_rows }
        }
        `,
        { flowId: sourceFlowId, userId, soloNoteId, cloneNoteId },
      );
    });

    afterAll(async () => {
      const flowIds = [sourceFlowId, newFlowId].filter(Boolean);
      await gqlAdmin(`
        mutation { delete_flow_note_positions(where: {flow_id: {_in: ${JSON.stringify(flowIds)}}}) { affected_rows } }
      `);
      await gqlAdmin(`
        mutation { delete_flow_note_content(where: {created_by: {_eq: ${userId}}}) { affected_rows } }
      `);
      await gqlAdmin(`
        mutation { delete_operations(where: {flow_id: {_in: ${JSON.stringify(flowIds)}}}) { affected_rows } }
      `);
      await gqlAdmin(`
        mutation { delete_flows(where: {id: {_in: ${JSON.stringify(flowIds)}}}) { affected_rows } }
      `);
      await gqlAdmin(`
        mutation { delete_users(where: {id: {_eq: ${userId}}}) { affected_rows } }
      `);
    });

    test("copy_flow atomically copies the flow, its operation, and its notes", async () => {
      const res = await gqlAdmin(
        `
        mutation CopyFlow($args: copy_flow_args!) {
          copy_flow(args: $args) { id }
        }
        `,
        {
          args: {
            source_flow_id: sourceFlowId,
            team_id: null,
            slug: "TEST_copy_flow_destination",
            name: "Test copy_flow destination",
            flow_data: {
              _root: {
                edges: [
                  renameNodeId("soloNode", replaceValue),
                  renameNodeId("cloneNode", replaceValue),
                ],
              },
            },
            is_service: false,
            is_pattern: false,
            replace_value: replaceValue,
            creator_id: userId,
          },
        },
      );
      assert.ok(!res.errors, JSON.stringify(res.errors));
      newFlowId = res.data.copy_flow.id;
      expect(newFlowId).toBeTruthy();

      const opRes = await gqlAdmin(`
        query { operations(where: {flow_id: {_eq: "${newFlowId}"}}) { id } }
      `);
      expect(opRes.data.operations).toHaveLength(1);

      const positionsRes = await gqlAdmin(`
        query {
          flowNotePositions: flow_note_positions(where: {flow_id: {_eq: "${newFlowId}"}}) {
            note_id
            node_id
            placement
            note { text color }
          }
        }
      `);
      const positions = positionsRes.data.flowNotePositions;
      expect(positions).toHaveLength(3);

      const soloNote = positions.find(
        (p) => p.node_id === renameNodeId("soloNode", replaceValue),
      );
      expect(soloNote.note.text).toBe("Solo note");

      const cloneWithPlacement = positions.find((p) => p.placement);
      expect(cloneWithPlacement.placement).toEqual({
        parent: "_root", // unchanged - renameNodeId leaves _root untouched
        before: renameNodeId("beforeNode", replaceValue),
      });

      const cloneWithNode = positions.find(
        (p) => p.node_id === renameNodeId("cloneNode", replaceValue),
      );
      expect(cloneWithNode.note.text).toBe("Cloned note");

      // the two clone positions share one new flow_note_content row, distinct from the solo note's
      expect(cloneWithNode.note_id).toBe(cloneWithPlacement.note_id);
      expect(cloneWithNode.note_id).not.toBe(soloNote.note_id);

      // copying doesn't mutate the source flow's own notes
      const sourcePositionsRes = await gqlAdmin(`
        query { flow_note_positions(where: {flow_id: {_eq: "${sourceFlowId}"}}) { note_id } }
      `);
      expect(sourcePositionsRes.data.flow_note_positions).toHaveLength(3);
    });

    test("copy_flow refuses to run without a creator_id", async () => {
      const res = await gqlAdmin(
        `
        mutation CopyFlow($args: copy_flow_args!) {
          copy_flow(args: $args) { id }
        }
        `,
        {
          args: {
            source_flow_id: sourceFlowId,
            team_id: null,
            slug: "TEST_copy_flow_no_creator",
            name: "Test copy_flow without a creator",
            flow_data: { _root: { edges: [] } },
            is_service: false,
            is_pattern: false,
            replace_value: replaceValue,
            creator_id: null,
          },
        },
      );

      expect(res.errors?.[0]?.extensions?.internal?.error?.message).toMatch(
        /requires a creator_id/,
      );

      const flowRes = await gqlAdmin(`
        query { flows(where: {slug: {_eq: "TEST_copy_flow_no_creator"}}) { id } }
      `);
      expect(flowRes.data.flows).toHaveLength(0);
    });
  });
});

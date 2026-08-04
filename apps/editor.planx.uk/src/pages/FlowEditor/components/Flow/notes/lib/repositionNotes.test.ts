import { graphql, HttpResponse } from "msw";
import { useStore } from "pages/FlowEditor/lib/store";
import server from "test/mockServer";
import { beforeEach, describe, expect, it } from "vitest";

import {
  repositionNotesForDeletedNodes,
  repositionNotesForMovedNode,
} from "./repositionNotes";

beforeEach(() => {
  useStore.setState({
    id: "flow-1",
    jwt: "test-jwt",
    user: {
      id: 42,
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      isPlatformAdmin: false,
      isAnalyst: false,
      defaultTeamId: null,
      teams: [],
    } as any,
  });
});

describe("repositionNotesForDeletedNodes", () => {
  it("deletes all attached notes whose node was deleted, regardless of author", async () => {
    let deleteIds: string[] | undefined;

    server.use(
      graphql.query("GetFlowNotePositionsForReposition", () =>
        HttpResponse.json({
          data: {
            flowNotePositions: [
              {
                id: "note-attached",
                nodeId: "deleted-node",
                placement: null,
                createdBy: 42,
              },
              {
                id: "note-other-author",
                nodeId: "deleted-node",
                placement: null,
                createdBy: 999,
              },
            ],
          },
        }),
      ),
      graphql.mutation("DeleteFlowNotePositions", ({ variables }) => {
        deleteIds = variables.ids;
        return HttpResponse.json({
          data: {
            delete_flow_note_positions: { affected_rows: variables.ids.length },
          },
        });
      }),
    );

    await repositionNotesForDeletedNodes(["deleted-node"], {}, {});

    expect(deleteIds).toEqual(
      expect.arrayContaining(["note-attached", "note-other-author"]),
    );
    expect(deleteIds).toHaveLength(2);
  });

  it("re-anchors a sibling-anchored positioned note to the surviving preceding sibling", async () => {
    const flowBefore = {
      _root: { edges: ["survivor", "deleted-node"] },
      survivor: { type: 8 },
      "deleted-node": { type: 8 },
    };
    const flowAfter = { _root: { edges: ["survivor"] } };
    let reanchored: any;

    server.use(
      graphql.query("GetFlowNotePositionsForReposition", () =>
        HttpResponse.json({
          data: {
            flowNotePositions: [
              {
                id: "note-after-deleted",
                nodeId: null,
                placement: { parent: "deleted-node" },
                createdBy: 42,
              },
            ],
          },
        }),
      ),
      graphql.mutation("ReanchorFlowNotePosition", ({ variables }) => {
        reanchored = variables;
        return HttpResponse.json({
          data: { update_flow_note_positions_by_pk: { id: variables.id } },
        });
      }),
    );

    await repositionNotesForDeletedNodes(
      ["deleted-node"],
      flowBefore,
      flowAfter,
    );

    expect(reanchored).toEqual({
      id: "note-after-deleted",
      placement: { parent: "survivor", container: "_root" },
    });
  });

  it("re-anchors a leading positioned note to the container's new first child when its before-target is deleted", async () => {
    const flowBefore = {
      _root: { edges: ["parent-container"] },
      "parent-container": { edges: ["deleted-node", "other-child"] },
      "deleted-node": { type: 200 },
      "other-child": { type: 200 },
    };
    const flowAfter = {
      _root: { edges: ["parent-container"] },
      "parent-container": { edges: ["other-child"] },
      "other-child": { type: 200 },
    };
    let reanchored: any;

    server.use(
      graphql.query("GetFlowNotePositionsForReposition", () =>
        HttpResponse.json({
          data: {
            flowNotePositions: [
              {
                id: "note-leading",
                nodeId: null,
                placement: {
                  parent: "parent-container",
                  before: "deleted-node",
                },
                createdBy: 42,
              },
            ],
          },
        }),
      ),
      graphql.mutation("ReanchorFlowNotePosition", ({ variables }) => {
        reanchored = variables;
        return HttpResponse.json({
          data: { update_flow_note_positions_by_pk: { id: variables.id } },
        });
      }),
    );

    await repositionNotesForDeletedNodes(
      ["deleted-node"],
      flowBefore,
      flowAfter,
    );

    expect(reanchored).toEqual({
      id: "note-leading",
      placement: {
        parent: "parent-container",
        before: "other-child",
        parentIsContainer: true,
      },
    });
  });

  it("deletes a positioned note when its entire container was also deleted", async () => {
    const flowBefore = {
      _root: { edges: ["folder"] },
      folder: { edges: ["child"] },
      child: { type: 8 },
    };
    const flowAfter = { _root: {} };
    let deleteIds: string[] | undefined;

    server.use(
      graphql.query("GetFlowNotePositionsForReposition", () =>
        HttpResponse.json({
          data: {
            flowNotePositions: [
              {
                id: "note-orphaned",
                nodeId: null,
                placement: { parent: "child" },
                createdBy: 42,
              },
            ],
          },
        }),
      ),
      graphql.mutation("DeleteFlowNotePositions", ({ variables }) => {
        deleteIds = variables.ids;
        return HttpResponse.json({
          data: {
            delete_flow_note_positions: { affected_rows: variables.ids.length },
          },
        });
      }),
    );

    await repositionNotesForDeletedNodes(
      ["folder", "child"],
      flowBefore,
      flowAfter,
    );

    expect(deleteIds).toEqual(["note-orphaned"]);
  });

  it("issues no mutations when there is nothing to reposition", async () => {
    let mutationCalled = false;

    server.use(
      graphql.query("GetFlowNotePositionsForReposition", () =>
        HttpResponse.json({ data: { flowNotePositions: [] } }),
      ),
      graphql.mutation("DeleteFlowNotePositions", () => {
        mutationCalled = true;
        return HttpResponse.json({
          data: { delete_flow_note_positions: { affected_rows: 0 } },
        });
      }),
    );

    await repositionNotesForDeletedNodes(["deleted-node"], {}, {});

    expect(mutationCalled).toBe(false);
  });
});

describe("repositionNotesForMovedNode", () => {
  it("re-anchors own leading notes to the new first child of the old parent", async () => {
    const reanchored: any[] = [];

    server.use(
      graphql.query("GetFlowNotePositionsForReposition", () =>
        HttpResponse.json({
          data: {
            flowNotePositions: [
              {
                id: "note-before-moved",
                nodeId: null,
                placement: { parent: "old-parent", before: "moved-node" },
                createdBy: 42,
              },
              {
                id: "note-elsewhere",
                nodeId: null,
                placement: { parent: "old-parent", before: "some-other-node" },
                createdBy: 42,
              },
            ],
          },
        }),
      ),
      graphql.mutation("ReanchorFlowNotePosition", ({ variables }) => {
        reanchored.push(variables);
        return HttpResponse.json({
          data: { update_flow_note_positions_by_pk: { id: variables.id } },
        });
      }),
    );

    await repositionNotesForMovedNode(
      "moved-node",
      "old-parent",
      "new-first-child",
    );

    expect(reanchored).toEqual([
      {
        id: "note-before-moved",
        placement: {
          parent: "old-parent",
          before: "new-first-child",
          parentIsContainer: true,
        },
      },
    ]);
  });
});

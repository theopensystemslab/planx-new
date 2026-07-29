import { graphql, HttpResponse } from "msw";
import server from "test/mockServer";
import { beforeEach, describe, expect, it } from "vitest";

import { useStore } from ".";

beforeEach(() => {
  localStorage.clear();
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

describe("createFlowNote", () => {
  it("sets created_by and updated_by from the current user", async () => {
    let capturedObject: any;

    server.use(
      graphql.mutation("CreateFlowNotePosition", ({ variables }) => {
        capturedObject = variables.object;
        return HttpResponse.json({
          data: { insert_flow_note_positions_one: { id: "new-note-id" } },
        });
      }),
    );

    const id = await useStore
      .getState()
      .createFlowNote({ nodeId: "node-a", text: "Hello" });

    expect(id).toBe("new-note-id");
    expect(capturedObject).toMatchObject({
      flow_id: "flow-1",
      node_id: "node-a",
      placement: null,
      created_by: 42,
      note: {
        data: {
          text: "Hello",
          created_by: 42,
          updated_by: 42,
        },
      },
    });
  });
});

describe("cloneFlowNote / pasteFlowNoteClone", () => {
  it("pastes a new position referencing the same content, without creating new content", async () => {
    let capturedObject: any;

    server.use(
      graphql.mutation("CreateFlowNotePosition", ({ variables }) => {
        capturedObject = variables.object;
        return HttpResponse.json({
          data: { insert_flow_note_positions_one: { id: "new-position-id" } },
        });
      }),
    );

    useStore.getState().cloneFlowNote("note-content-1");
    expect(useStore.getState().getClonedFlowNoteId()).toBe("note-content-1");

    const id = await useStore.getState().pasteFlowNoteClone({
      placement: { parent: "_root", before: "node-a", parentIsContainer: true },
    });

    expect(id).toBe("new-position-id");
    expect(capturedObject).toMatchObject({
      flow_id: "flow-1",
      note_id: "note-content-1",
      created_by: 42,
      placement: { parent: "_root", before: "node-a", parentIsContainer: true },
    });
    expect(capturedObject.note).toBeUndefined();
  });
});

describe("copyFlowNote / pasteFlowNoteCopy", () => {
  it("pastes an independent copy of the content", async () => {
    let capturedObject: any;

    server.use(
      graphql.query("GetFlowNoteContent", () =>
        HttpResponse.json({
          data: {
            flow_note_content_by_pk: {
              text: "Source note text",
              color: "#fffdb0",
            },
          },
        }),
      ),
      graphql.mutation("CreateFlowNotePosition", ({ variables }) => {
        capturedObject = variables.object;
        return HttpResponse.json({
          data: { insert_flow_note_positions_one: { id: "new-position-id" } },
        });
      }),
    );

    await useStore.getState().copyFlowNote("note-content-1");
    expect(useStore.getState().getCopiedFlowNote()).toEqual({
      text: "Source note text",
      color: "#fffdb0",
    });

    const id = await useStore.getState().pasteFlowNoteCopy({
      placement: { parent: "_root", before: "node-a", parentIsContainer: true },
    });

    expect(id).toBe("new-position-id");
    expect(capturedObject).toMatchObject({
      flow_id: "flow-1",
      created_by: 42,
      placement: { parent: "_root", before: "node-a", parentIsContainer: true },
      note: {
        data: {
          text: "Source note text",
          color: "#fffdb0",
          created_by: 42,
          updated_by: 42,
        },
      },
    });
    expect(capturedObject.note_id).toBeUndefined();
  });
});

describe("repositionNotesForDeletedNodes", () => {
  it("deletes all attached notes whose node was deleted, regardless of author", async () => {
    let deleteIds: string[] | undefined;

    server.use(
      graphql.query("GetFlowNotePositionsForReposition", () =>
        HttpResponse.json({
          data: {
            flow_note_positions: [
              {
                id: "note-attached",
                node_id: "deleted-node",
                placement: null,
                created_by: 42,
              },
              {
                id: "note-other-author",
                node_id: "deleted-node",
                placement: null,
                created_by: 999,
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

    await useStore
      .getState()
      .repositionNotesForDeletedNodes(["deleted-node"], {}, {});

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
            flow_note_positions: [
              {
                id: "note-after-deleted",
                node_id: null,
                placement: { parent: "deleted-node" },
                created_by: 42,
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

    await useStore
      .getState()
      .repositionNotesForDeletedNodes(["deleted-node"], flowBefore, flowAfter);

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
            flow_note_positions: [
              {
                id: "note-leading",
                node_id: null,
                placement: {
                  parent: "parent-container",
                  before: "deleted-node",
                },
                created_by: 42,
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

    await useStore
      .getState()
      .repositionNotesForDeletedNodes(["deleted-node"], flowBefore, flowAfter);

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
            flow_note_positions: [
              {
                id: "note-orphaned",
                node_id: null,
                placement: { parent: "child" },
                created_by: 42,
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

    await useStore
      .getState()
      .repositionNotesForDeletedNodes(
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
        HttpResponse.json({ data: { flow_note_positions: [] } }),
      ),
      graphql.mutation("DeleteFlowNotePositions", () => {
        mutationCalled = true;
        return HttpResponse.json({
          data: { delete_flow_note_positions: { affected_rows: 0 } },
        });
      }),
    );

    await useStore
      .getState()
      .repositionNotesForDeletedNodes(["deleted-node"], {}, {});

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
            flow_note_positions: [
              {
                id: "note-before-moved",
                node_id: null,
                placement: { parent: "old-parent", before: "moved-node" },
                created_by: 42,
              },
              {
                id: "note-elsewhere",
                node_id: null,
                placement: { parent: "old-parent", before: "some-other-node" },
                created_by: 42,
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

    await useStore
      .getState()
      .repositionNotesForMovedNode(
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

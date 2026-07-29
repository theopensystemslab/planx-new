import { screen } from "@testing-library/react";
import { graphql, HttpResponse } from "msw";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import server from "test/mockServer";
import { setup } from "test/utils";
import { describe, expect, it } from "vitest";

import { useMoveFlowNotePosition } from "./useMoveFlowNotePosition";

const MoveFlowNotePositionTestHarness: React.FC<{
  positionId: string;
  container: string;
  before?: string;
}> = ({ positionId, container, before }) => {
  const { moveFlowNotePosition } = useMoveFlowNotePosition();

  return (
    <button
      type="button"
      onClick={() => moveFlowNotePosition(positionId, container, before)}
    >
      Move
    </button>
  );
};

describe("useMoveFlowNotePosition", () => {
  it("re-anchors a dragged note to the dropped hanger's coordinate", async () => {
    useStore.setState({
      flow: {
        _root: { edges: ["node-a", "node-b"] },
        "node-a": { type: 200 },
        "node-b": { type: 200 },
      } as any,
    });

    let reanchored: any;
    server.use(
      graphql.mutation("ReanchorFlowNotePosition", ({ variables }) => {
        reanchored = variables;
        return HttpResponse.json({
          data: { update_flow_note_positions_by_pk: { id: variables.id } },
        });
      }),
    );

    const { user } = await setup(
      <MoveFlowNotePositionTestHarness
        positionId="dragged-note"
        container="_root"
        before="node-b"
      />,
    );
    await user.click(screen.getByRole("button", { name: "Move" }));

    expect(reanchored).toEqual({
      id: "dragged-note",
      placement: { parent: "node-a", container: "_root" },
    });
  });

  it("re-anchors to a container's leading slot when dropped with no preceding sibling", async () => {
    useStore.setState({
      flow: {
        _root: { edges: ["node-a"] },
        "node-a": { type: 200 },
      } as any,
    });

    let reanchored: any;
    server.use(
      graphql.mutation("ReanchorFlowNotePosition", ({ variables }) => {
        reanchored = variables;
        return HttpResponse.json({
          data: { update_flow_note_positions_by_pk: { id: variables.id } },
        });
      }),
    );

    const { user } = await setup(
      <MoveFlowNotePositionTestHarness
        positionId="dragged-note"
        container="_root"
        before="node-a"
      />,
    );
    await user.click(screen.getByRole("button", { name: "Move" }));

    expect(reanchored).toEqual({
      id: "dragged-note",
      placement: { parent: "_root", before: "node-a", parentIsContainer: true },
    });
  });
});

import { ROOT_NODE_KEY } from "@planx/graph";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { resolveNotePlacement } from "pages/FlowEditor/components/Flow/notes/lib/notePlacement";
import { NoteEditorDialog } from "pages/FlowEditor/components/Flow/notes/NoteEditorDialog";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { z } from "zod";

const noteAddSearchSchema = z.object({
  nodeId: z.string().optional(),
  parent: z.string().optional(),
  before: z.string().optional(),
});

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/_flowEditor/note/add",
)({
  validateSearch: zodValidator(noteAddSearchSchema),
  component: AddNoteModal,
});

function AddNoteModal() {
  const { nodeId, parent, before } = Route.useSearch();
  const { team, flow } = Route.useParams();
  const navigate = useNavigate();
  const flowGraph = useStore((state) => state.flow);

  const handleClose = () =>
    navigate({ to: "/app/$team/$flow", params: { team, flow } });

  const placement = nodeId
    ? undefined
    : resolveNotePlacement(flowGraph, parent ?? ROOT_NODE_KEY, before);

  return (
    <NoteEditorDialog
      mode="create"
      nodeId={nodeId}
      placement={placement}
      onClose={handleClose}
    />
  );
}

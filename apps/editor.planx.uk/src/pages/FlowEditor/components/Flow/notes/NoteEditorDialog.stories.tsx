import type { Meta, StoryObj } from "@storybook/tanstack-react";
import type { FlowNote } from "hooks/data/useFlowNotes";
import { graphql, HttpResponse } from "msw";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import { NoteEditorDialog } from "./NoteEditorDialog";

const note: FlowNote = {
  id: "note-1",
  flowId: "flow-1",
  nodeId: "node-a",
  placement: null,
  text: "This is an existing note that you're about to edit",
  color: "#fffdb0",
  createdBy: 1,
  updatedBy: 1,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const meta = {
  title: "Editor Components/Graph/Notes/NoteEditorDialog",
  component: NoteEditorDialog,
} satisfies Meta<typeof NoteEditorDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Create = {
  args: { mode: "create", nodeId: "node-a", onClose: () => {} },
  parameters: {
    msw: {
      handlers: [
        graphql.mutation("CreateFlowNote", ({ variables }) => {
          console.log("createFlowNote", variables.object);
          return HttpResponse.json({
            data: { insert_flow_notes_one: { id: "new-note-id" } },
          });
        }),
      ],
    },
  },
  render: (args) => {
    useStore.setState({ id: "flow-1" });
    return <NoteEditorDialog {...args} />;
  },
} satisfies Story;

export const Edit = {
  args: { mode: "edit", note, onClose: () => {} },
  parameters: {
    msw: {
      handlers: [
        graphql.mutation("UpdateFlowNote", ({ variables }) => {
          console.log("updateFlowNote", variables.id, variables.set);
          return HttpResponse.json({
            data: { update_flow_notes_by_pk: { id: variables.id as string } },
          });
        }),
        graphql.mutation("DeleteFlowNote", ({ variables }) => {
          console.log("deleteFlowNote", variables.id);
          return HttpResponse.json({
            data: { delete_flow_notes_by_pk: { id: variables.id as string } },
          });
        }),
      ],
    },
  },
  render: (args) => {
    useStore.setState({ id: "flow-1" });
    return <NoteEditorDialog {...args} />;
  },
} satisfies Story;

import type { Meta, StoryObj } from "@storybook/tanstack-react";
import type { FlowNote } from "hooks/data/useFlowNotes";
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
  title: "Editor Components/Notes/NoteEditorDialog",
  component: NoteEditorDialog,
} satisfies Meta<typeof NoteEditorDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Create = {
  render: () => {
    useStore.setState({
      noteEditorOpen: true,
      noteEditorMode: "create",
      noteEditorNote: undefined,
      noteEditorNodeId: "node-a",
      noteEditorPlacement: undefined,
      createFlowNote: async (input) => {
        console.log("createFlowNote", input);
        return "new-note-id";
      },
    });
    return <NoteEditorDialog />;
  },
} satisfies Story;

export const Edit = {
  render: () => {
    useStore.setState({
      noteEditorOpen: true,
      noteEditorMode: "edit",
      noteEditorNote: note,
      noteEditorNodeId: undefined,
      noteEditorPlacement: undefined,
      updateFlowNote: async (id, patch) => {
        console.log("updateFlowNote", id, patch);
      },
      deleteFlowNote: async (id) => {
        console.log("deleteFlowNote", id);
      },
    });
    return <NoteEditorDialog />;
  },
} satisfies Story;

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
  title: "Editor Components/Graph/Notes/NoteEditorDialog",
  component: NoteEditorDialog,
} satisfies Meta<typeof NoteEditorDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Create = {
  args: { mode: "create", nodeId: "node-a", onClose: () => {} },
  render: (args) => {
    useStore.setState({
      createFlowNote: async (input) => {
        console.log("createFlowNote", input);
        return "new-note-id";
      },
    });
    return <NoteEditorDialog {...args} />;
  },
} satisfies Story;

export const Edit = {
  args: { mode: "edit", note, onClose: () => {} },
  render: (args) => {
    useStore.setState({
      updateFlowNote: async (id, patch) => {
        console.log("updateFlowNote", id, patch);
      },
      deleteFlowNote: async (id) => {
        console.log("deleteFlowNote", id);
      },
    });
    return <NoteEditorDialog {...args} />;
  },
} satisfies Story;

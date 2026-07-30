import "pages/FlowEditor/floweditor.scss";

import type { Meta, StoryObj } from "@storybook/tanstack-react";
import type { FlowNote } from "hooks/data/useFlowNotes";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import { AttachedNotes } from "./AttachedNotes";
import { FlowNotesContext } from "./FlowNotesContext";
import { NoteEditorDialog } from "./NoteEditorDialog";

const notes: FlowNote[] = [
  {
    id: "note-1",
    flowId: "flow-1",
    nodeId: "node-a",
    placement: null,
    text: "This is a note which is attached to a node",
    color: "#fffdb0",
    createdBy: 1,
    updatedBy: 1,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

const longNotes: FlowNote[] = [
  {
    ...notes[0],
    id: "note-2",
    text: "This note has a lot more text in it than usual, so long in fact that it must be truncated with ellipses and line clamping, the full version is visible in the note editor.",
  },
];

const meta = {
  title: "Editor Components/Graph/Notes/AttachedNotes",
  component: AttachedNotes,
} satisfies Meta<typeof AttachedNotes>;

export default meta;

type Story = StoryObj<typeof meta>;

const AttachedNotesDemo: React.FC<{ notes: FlowNote[] }> = ({
  notes: notesToRender,
}) => {
  useStore.setState({
    updateFlowNote: async (id, patch) => {
      console.log("updateFlowNote", id, patch);
    },
    deleteFlowNote: async (id) => {
      console.log("deleteFlowNote", id);
    },
  });

  const noteEditorOpen = useStore((state) => state.noteEditorOpen);

  return (
    <FlowNotesContext.Provider
      value={{
        attached: new Map([["node-a", notesToRender]]),
        positioned: new Map(),
        loading: false,
      }}
    >
      <ul
        style={{
          display: "flex",
          gap: 24,
          alignItems: "flex-start",
          listStyle: "none",
          padding: 0,
          margin: 0,
        }}
      >
        <li className="card decision type-Question">
          <div className="card-wrapper">
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid -- decorative mock of the real node markup */}
            <a>
              <span>A node with an attached note</span>
            </a>
            <AttachedNotes nodeId="node-a" />
          </div>
        </li>
        {noteEditorOpen && <NoteEditorDialog />}
      </ul>
    </FlowNotesContext.Provider>
  );
};

export const Default = {
  args: { nodeId: "node-a" },
  render: () => <AttachedNotesDemo notes={notes} />,
} satisfies Story;

export const LongText = {
  args: { nodeId: "node-a" },
  render: () => <AttachedNotesDemo notes={longNotes} />,
} satisfies Story;

import "pages/FlowEditor/floweditor.scss";

import type { Meta, StoryObj } from "@storybook/tanstack-react";
import type { FlowNote } from "hooks/data/useFlowNotes";
import React from "react";

import { AttachedNotes } from "./AttachedNotes";
import { FlowNotesContext } from "./FlowNotesContext";

const notes: FlowNote[] = [
  {
    id: "note-1",
    flowId: "flow-1",
    nodeId: "node-a",
    placement: null,
    text: "This is a note which is attached to a node and visible to all editors of the flow",
    color: "#fffdb0",
    createdBy: 1,
    updatedBy: 1,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

const meta = {
  title: "Editor Components/Graph/Notes/AttachedNotes",
  component: AttachedNotes,
  decorators: [
    (Story) => (
      <FlowNotesContext.Provider
        value={{
          attached: new Map([["node-a", notes]]),
          positioned: new Map(),
          loading: false,
        }}
      >
        <Story />
      </FlowNotesContext.Provider>
    ),
  ],
} satisfies Meta<typeof AttachedNotes>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {
  args: { nodeId: "node-a" },
  render: () => (
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
    </ul>
  ),
} satisfies Story;

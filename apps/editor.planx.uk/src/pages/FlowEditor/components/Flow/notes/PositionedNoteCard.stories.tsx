import "pages/FlowEditor/floweditor.scss";

import type { Meta, StoryObj } from "@storybook/tanstack-react";
import type { FlowNote } from "hooks/data/useFlowNotes";
import React from "react";

import { PositionedNoteCard } from "./PositionedNoteCard";

const note: FlowNote = {
  id: "note-1",
  flowId: "flow-1",
  nodeId: null,
  placement: { parent: "_root", before: "node-a", parentIsContainer: true },
  text: "this note is positioned in between nodes",
  color: "#fffdb0",
  createdBy: 1,
  updatedBy: 1,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const meta = {
  title: "Editor Components/Notes/PositionedNoteCard",
  component: PositionedNoteCard,
} satisfies Meta<typeof PositionedNoteCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {
  args: { note },
  render: () => (
    <ul
      data-layout="top-down"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        listStyle: "none",
        padding: 0,
        margin: 0,
      }}
    >
      <li className="card decision type-Question">
        <div className="card-wrapper">
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid -- decorative mock of the real node markup */}
          <a>
            <span>Node A</span>
          </a>
        </div>
      </li>
      <li className="hanger">
        <button type="button" />
      </li>
      <li className="hanger note-connector" aria-hidden="true" />
      <PositionedNoteCard note={note} />
      <li className="hanger">
        <button type="button" />
      </li>
      <li className="card decision type-Question">
        <div className="card-wrapper">
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid -- decorative mock of the real node markup */}
          <a>
            <span>Node B</span>
          </a>
        </div>
      </li>
    </ul>
  ),
} satisfies Story;

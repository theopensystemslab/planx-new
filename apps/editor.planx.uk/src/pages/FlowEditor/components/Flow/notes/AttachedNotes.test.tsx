import type { FlowNote } from "hooks/data/useFlowNotes";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { setup } from "test/utils";
import { beforeEach, describe, expect, it } from "vitest";

import { AttachedNotes } from "./AttachedNotes";
import { FlowNotesContext } from "./FlowNotesContext";

const makeNote = (overrides: Partial<FlowNote> = {}): FlowNote => ({
  id: "note-1",
  flowId: "flow-1",
  nodeId: "node-a",
  placement: null,
  text: "Remember to check this",
  color: "#fffdb0",
  createdBy: 1,
  updatedBy: 1,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  ...overrides,
});

const renderWithNotes = async (
  nodeId: string,
  attached: Map<string, FlowNote[]>,
) =>
  setup(
    <FlowNotesContext.Provider
      value={{ attached, positioned: new Map(), loading: false }}
    >
      <AttachedNotes nodeId={nodeId} />
    </FlowNotesContext.Provider>,
  );

beforeEach(() => {
  useStore.setState({ showNotes: true });
});

describe("AttachedNotes", () => {
  it("renders the note text directly, for a node with an attached note", async () => {
    const attached = new Map([
      ["node-a", [makeNote({ text: "Remember to check this" })]],
    ]);

    const { getByText } = await renderWithNotes("node-a", attached);

    expect(getByText("Remember to check this")).toBeInTheDocument();
  });

  it("renders nothing for a node with no attached notes", async () => {
    const attached = new Map([["node-a", [makeNote()]]]);

    const { queryByText } = await renderWithNotes("node-b", attached);

    expect(queryByText("Remember to check this")).not.toBeInTheDocument();
  });

  it("renders nothing when showNotes is false", async () => {
    useStore.setState({ showNotes: false });
    const attached = new Map([["node-a", [makeNote()]]]);

    const { queryByText } = await renderWithNotes("node-a", attached);

    expect(queryByText("Remember to check this")).not.toBeInTheDocument();
  });

  it("renders a row for each attached note when there are several", async () => {
    const attached = new Map([
      [
        "node-a",
        [
          makeNote({ id: "note-1", text: "First note" }),
          makeNote({ id: "note-2", text: "Second note" }),
        ],
      ],
    ]);

    const { getByText } = await renderWithNotes("node-a", attached);

    expect(getByText("First note")).toBeInTheDocument();
    expect(getByText("Second note")).toBeInTheDocument();
  });
});

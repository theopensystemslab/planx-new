import { fireEvent, screen } from "@testing-library/react";
import type { FlowNote } from "hooks/data/useFlowNotes";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { setup } from "test/utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AttachedNotes } from "./AttachedNotes";
import { FlowNotesContext } from "./FlowNotesContext";

const navigate = vi.fn();

vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual("@tanstack/react-router");
  return {
    ...actual,
    useParams: () => ({ team: "test-team", flow: "test-flow" }),
    useNavigate: () => navigate,
  };
});

const makeNote = (overrides: Partial<FlowNote> = {}): FlowNote =>
  ({
    positionId: "note-1",
    contentId: "note-content-1",
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
  }) as FlowNote;

const renderWithNotes = async (
  nodeId: string,
  attached: Map<string, FlowNote[]>,
  clonedContentIds: Set<string> = new Set(),
) =>
  setup(
    <FlowNotesContext.Provider
      value={{
        attached,
        positioned: new Map(),
        loading: false,
        clonedContentIds,
      }}
    >
      <AttachedNotes nodeId={nodeId} />
    </FlowNotesContext.Provider>,
  );

beforeEach(() => {
  useStore.setState({ showNotes: true });
  navigate.mockClear();
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
          makeNote({ positionId: "note-1", text: "First note" }),
          makeNote({ positionId: "note-2", text: "Second note" }),
        ],
      ],
    ]);

    const { getByText } = await renderWithNotes("node-a", attached);

    expect(getByText("First note")).toBeInTheDocument();
    expect(getByText("Second note")).toBeInTheDocument();
  });

  it("navigates to the note's edit route when clicked", async () => {
    const attached = new Map([
      [
        "node-a",
        [makeNote({ positionId: "note-1", text: "Remember to check this" })],
      ],
    ]);

    await renderWithNotes("node-a", attached);

    fireEvent.click(screen.getByText("Remember to check this"));

    expect(navigate).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "/app/$team/$flow/note/$id/edit",
        params: { team: "test-team", flow: "test-flow", id: "note-1" },
      }),
    );
  });

  it("marks a note as a clone when its contentId is shared with another position", async () => {
    const attached = new Map([
      ["node-a", [makeNote({ contentId: "shared-content" })]],
    ]);

    const { container } = await renderWithNotes(
      "node-a",
      attached,
      new Set(["shared-content"]),
    );

    expect(
      container.querySelector(".attached-note-wrapper.isClone"),
    ).toBeInTheDocument();
  });

  it("does not mark a note as a clone when its contentId is unique", async () => {
    const attached = new Map([
      ["node-a", [makeNote({ contentId: "unique-content" })]],
    ]);

    const { container } = await renderWithNotes("node-a", attached);

    expect(
      container.querySelector(".attached-note-wrapper.isClone"),
    ).not.toBeInTheDocument();
  });
});

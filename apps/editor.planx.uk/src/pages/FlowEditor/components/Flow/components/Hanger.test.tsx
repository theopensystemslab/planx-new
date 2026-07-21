import { fireEvent, screen } from "@testing-library/react";
import type { FlowNote } from "hooks/data/useFlowNotes";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { setup } from "test/utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FlowNotesContext } from "../notes/FlowNotesContext";
import { placementKey } from "../notes/lib/partitionNotes";
import Hanger from "./Hanger";

vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual("@tanstack/react-router");
  return {
    ...actual,
    useParams: () => ({ team: "test-team", flow: "test-flow" }),
  };
});

const makeNote = (overrides: Partial<FlowNote> = {}): FlowNote => ({
  id: "note-1",
  flowId: "flow-1",
  nodeId: null,
  placement: { parent: "root" },
  text: "A positioned note",
  color: "#fffdb0",
  createdBy: 1,
  updatedBy: 1,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  ...overrides,
});

const renderHanger = (
  props: React.ComponentProps<typeof Hanger>,
  positioned: Map<string, FlowNote[]> = new Map(),
) =>
  setup(
    <DndProvider backend={HTML5Backend}>
      <FlowNotesContext.Provider
        value={{ attached: new Map(), positioned, loading: false }}
      >
        <ol>
          <Hanger {...props} />
        </ol>
      </FlowNotesContext.Provider>
    </DndProvider>,
  );

beforeEach(() => {
  useStore.setState({
    flow: {},
    orderedFlow: undefined,
    isTemplatedFrom: false,
    showNotes: true,
    user: {
      id: 1,
      isPlatformAdmin: true,
      isAnalyst: false,
      teams: [],
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      defaultTeamId: null,
    } as any,
    componentSelectorOpen: false,
    componentSelectorParent: undefined,
    componentSelectorBefore: undefined,
    contextMenuSource: null,
    contextMenuPosition: null,
  });
});

describe("positioned notes", () => {
  it("renders a note-card for each note at this hanger's coordinate", async () => {
    const positioned = new Map([
      [placementKey("root", "node-a"), [makeNote({ text: "First" })]],
    ]);

    await renderHanger({ parent: "root", before: "node-a" }, positioned);

    expect(screen.getByText("First")).toBeInTheDocument();
  });

  it("does not render notes belonging to a different coordinate", async () => {
    const positioned = new Map([
      [placementKey("root", "node-b"), [makeNote({ text: "Elsewhere" })]],
    ]);

    await renderHanger({ parent: "root", before: "node-a" }, positioned);

    expect(screen.queryByText("Elsewhere")).not.toBeInTheDocument();
  });

  it("hides positioned notes when showNotes is false", async () => {
    useStore.setState({ showNotes: false });
    const positioned = new Map([
      [placementKey("root", "node-a"), [makeNote({ text: "Hidden note" })]],
    ]);

    await renderHanger({ parent: "root", before: "node-a" }, positioned);

    expect(screen.queryByText("Hidden note")).not.toBeInTheDocument();
  });

  it("renders a decorative connector line separating the note from the preceding node", async () => {
    const positioned = new Map([
      [placementKey("root", "node-a"), [makeNote({ text: "First" })]],
    ]);

    const { container } = await renderHanger(
      { parent: "root", before: "node-a" },
      positioned,
    );

    expect(container.querySelector("li.note-connector")).toBeInTheDocument();
  });

  it("does not render a connector line when there are no notes to show", async () => {
    const { container } = await renderHanger({
      parent: "root",
      before: "node-a",
    });

    expect(
      container.querySelector("li.note-connector"),
    ).not.toBeInTheDocument();
  });
});

describe("hanger interactions", () => {
  it("opens the component selector on click, unchanged", async () => {
    await renderHanger({ parent: "root", before: "node-a" });

    fireEvent.click(screen.getByRole("button"));

    expect(useStore.getState().componentSelectorOpen).toBe(true);
  });

  it("sets the context menu source to hanger on right-click", async () => {
    await renderHanger({ parent: "root", before: "node-a" });

    fireEvent.contextMenu(screen.getByRole("button"));

    expect(useStore.getState().contextMenuSource).toBe("hanger");
  });
});

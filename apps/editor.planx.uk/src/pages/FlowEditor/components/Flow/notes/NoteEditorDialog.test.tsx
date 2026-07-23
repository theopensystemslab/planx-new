import { screen } from "@testing-library/react";
import type { AttachedNote } from "hooks/data/useFlowNotes";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { setup } from "test/utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { NoteEditorDialog } from "./NoteEditorDialog";

const makeNote = (overrides: Partial<AttachedNote> = {}): AttachedNote => ({
  id: "note-1",
  flowId: "flow-1",
  nodeId: "node-a",
  placement: null,
  text: "Existing note text",
  color: "#fffdb0",
  createdBy: 1,
  updatedBy: 1,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  ...overrides,
});

const currentUser = {
  id: 1,
  isPlatformAdmin: false,
  isAnalyst: false,
  teams: [],
  firstName: "Test",
  lastName: "User",
  email: "test@example.com",
  defaultTeamId: null,
} as any;

beforeEach(() => {
  useStore.setState({
    user: currentUser,
    noteEditorOpen: true,
    noteEditorMode: null,
    noteEditorNote: undefined,
    noteEditorNodeId: undefined,
    noteEditorPlacement: undefined,
    createFlowNote: vi.fn().mockResolvedValue("new-id"),
    updateFlowNote: vi.fn().mockResolvedValue(undefined),
    deleteFlowNote: vi.fn().mockResolvedValue(undefined),
  });
});

describe("create mode", () => {
  it("shows a Create button, not Update", async () => {
    useStore.setState({ noteEditorMode: "create" });

    await setup(<NoteEditorDialog />);

    expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /update/i }),
    ).not.toBeInTheDocument();
  });

  it("calls createFlowNote with the node id and entered text on save", async () => {
    useStore.setState({
      noteEditorMode: "create",
      noteEditorNodeId: "node-a",
    });

    const { user } = await setup(<NoteEditorDialog />);

    await user.type(screen.getByRole("textbox"), "A brand new note");
    await user.click(screen.getByRole("button", { name: /create/i }));

    expect(useStore.getState().createFlowNote).toHaveBeenCalledWith(
      expect.objectContaining({ nodeId: "node-a", text: "A brand new note" }),
    );
  });

  it("closes the editor after saving", async () => {
    useStore.setState({
      noteEditorMode: "create",
      noteEditorPlacement: {
        parent: "root",
        parentIsContainer: true,
        before: "node-a",
      },
    });

    const { user } = await setup(<NoteEditorDialog />);
    await user.click(screen.getByRole("button", { name: /create/i }));

    expect(useStore.getState().noteEditorOpen).toBe(false);
  });

  it("has no delete button", async () => {
    useStore.setState({ noteEditorMode: "create" });

    await setup(<NoteEditorDialog />);

    expect(
      screen.queryByRole("button", { name: /delete/i }),
    ).not.toBeInTheDocument();
  });
});

describe("edit mode - own note", () => {
  it("pre-fills the existing note text", async () => {
    useStore.setState({ noteEditorMode: "edit", noteEditorNote: makeNote() });

    await setup(<NoteEditorDialog />);

    expect(screen.getByDisplayValue("Existing note text")).toBeInTheDocument();
  });

  it("calls updateFlowNote with the note id on save", async () => {
    useStore.setState({ noteEditorMode: "edit", noteEditorNote: makeNote() });

    const { user } = await setup(<NoteEditorDialog />);
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "Updated text");
    await user.click(screen.getByRole("button", { name: /update/i }));

    expect(useStore.getState().updateFlowNote).toHaveBeenCalledWith(
      "note-1",
      expect.objectContaining({ text: "Updated text" }),
    );
  });

  it("calls deleteFlowNote and closes the editor when Delete is clicked", async () => {
    useStore.setState({ noteEditorMode: "edit", noteEditorNote: makeNote() });

    const { user } = await setup(<NoteEditorDialog />);
    await user.click(screen.getByRole("button", { name: /delete/i }));

    expect(useStore.getState().deleteFlowNote).toHaveBeenCalledWith("note-1");
    expect(useStore.getState().noteEditorOpen).toBe(false);
  });
});

describe("edit mode - another author's note", () => {
  it("still allows editing and deleting, since notes are shared across the team", async () => {
    useStore.setState({
      noteEditorMode: "edit",
      noteEditorNote: makeNote({ createdBy: 999 }),
    });

    const { user } = await setup(<NoteEditorDialog />);

    expect(screen.getByRole("button", { name: /delete/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /update/i })).toBeEnabled();

    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "Edited by another user");
    await user.click(screen.getByRole("button", { name: /update/i }));

    expect(useStore.getState().updateFlowNote).toHaveBeenCalledWith(
      "note-1",
      expect.objectContaining({ text: "Edited by another user" }),
    );
  });
});

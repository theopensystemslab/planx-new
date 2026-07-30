import { screen } from "@testing-library/react";
import type { AttachedNote } from "hooks/data/useFlowNotes";
import { graphql, HttpResponse } from "msw";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import server from "test/mockServer";
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

let createFlowNote: (object: unknown) => void;
let updateFlowNote: (id: unknown, set: unknown) => void;
let deleteFlowNote: (id: unknown) => void;

beforeEach(() => {
  useStore.setState({ id: "flow-1" });

  createFlowNote = vi.fn();
  updateFlowNote = vi.fn();
  deleteFlowNote = vi.fn();

  server.use(
    graphql.mutation("CreateFlowNote", ({ variables }) => {
      createFlowNote(variables.object);
      return HttpResponse.json({
        data: { insert_flow_notes_one: { id: "new-id" } },
      });
    }),
    graphql.mutation("UpdateFlowNote", ({ variables }) => {
      updateFlowNote(variables.id, variables.set);
      return HttpResponse.json({
        data: { update_flow_notes_by_pk: { id: variables.id as string } },
      });
    }),
    graphql.mutation("DeleteFlowNote", ({ variables }) => {
      deleteFlowNote(variables.id);
      return HttpResponse.json({
        data: { delete_flow_notes_by_pk: { id: variables.id as string } },
      });
    }),
  );
});

describe("create mode", () => {
  it("shows a Create button, not Update", async () => {
    await setup(<NoteEditorDialog mode="create" onClose={vi.fn()} />);

    expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /update/i }),
    ).not.toBeInTheDocument();
  });

  it("calls createFlowNote with the node id and entered text on save", async () => {
    const { user } = await setup(
      <NoteEditorDialog mode="create" nodeId="node-a" onClose={vi.fn()} />,
    );

    await user.type(screen.getByRole("textbox"), "A brand new note");
    await user.click(screen.getByRole("button", { name: /create/i }));

    expect(createFlowNote).toHaveBeenCalledWith(
      expect.objectContaining({
        node_id: "node-a",
        text: "A brand new note",
      }),
    );
  });

  it("closes the editor after saving", async () => {
    const onClose = vi.fn();
    const { user } = await setup(
      <NoteEditorDialog
        mode="create"
        placement={{
          parent: "root",
          parentIsContainer: true,
          before: "node-a",
        }}
        onClose={onClose}
      />,
    );
    await user.type(screen.getByRole("textbox"), "A brand new note");
    await user.click(screen.getByRole("button", { name: /create/i }));

    expect(onClose).toHaveBeenCalled();
  });

  it("has no delete button", async () => {
    await setup(<NoteEditorDialog mode="create" onClose={vi.fn()} />);

    expect(
      screen.queryByRole("button", { name: /delete/i }),
    ).not.toBeInTheDocument();
  });

  it("disables the Create button while the note is empty", async () => {
    await setup(<NoteEditorDialog mode="create" onClose={vi.fn()} />);

    expect(screen.getByRole("button", { name: /create/i })).toBeDisabled();
  });

  it("enables the Create button once text is entered, and disables it again if cleared", async () => {
    const { user } = await setup(
      <NoteEditorDialog mode="create" onClose={vi.fn()} />,
    );
    const createButton = screen.getByRole("button", { name: /create/i });
    const textbox = screen.getByRole("textbox");

    await user.type(textbox, "A brand new note");
    expect(createButton).toBeEnabled();

    await user.clear(textbox);
    expect(createButton).toBeDisabled();
  });

  it("does not call createFlowNote when the note is empty", async () => {
    const onClose = vi.fn();
    const { user } = await setup(
      <NoteEditorDialog mode="create" onClose={onClose} />,
    );
    await user.click(screen.getByRole("button", { name: /create/i }));

    expect(createFlowNote).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("shows a validation error once an empty note is touched", async () => {
    const { user } = await setup(
      <NoteEditorDialog mode="create" onClose={vi.fn()} />,
    );
    const textbox = screen.getByRole("textbox");

    await user.click(textbox);
    await user.tab();

    expect(await screen.findByText(/Enter a note/)).toBeInTheDocument();
  });

  it("shows an error toast if the note fails to save", async () => {
    server.use(
      graphql.mutation("CreateFlowNote", () => {
        return HttpResponse.json(
          { errors: [{ message: "Something went wrong" }] },
          { status: 200 },
        );
      }),
    );
    const { user } = await setup(
      <NoteEditorDialog mode="create" onClose={vi.fn()} />,
    );

    await user.type(screen.getByRole("textbox"), "A brand new note");
    await user.click(screen.getByRole("button", { name: /create/i }));

    expect(await screen.findByText(/Failed to save note/i)).toBeInTheDocument();
  });
});

describe("edit mode - own note", () => {
  it("pre-fills the existing note text", async () => {
    await setup(
      <NoteEditorDialog mode="edit" note={makeNote()} onClose={vi.fn()} />,
    );

    expect(screen.getByDisplayValue("Existing note text")).toBeInTheDocument();
  });

  it("calls updateFlowNote with the note id on save", async () => {
    const { user } = await setup(
      <NoteEditorDialog mode="edit" note={makeNote()} onClose={vi.fn()} />,
    );
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "Updated text");
    await user.click(screen.getByRole("button", { name: /update/i }));

    expect(updateFlowNote).toHaveBeenCalledWith(
      "note-1",
      expect.objectContaining({ text: "Updated text" }),
    );
  });

  it("calls deleteFlowNote and closes the editor when Delete is clicked", async () => {
    const onClose = vi.fn();
    const { user } = await setup(
      <NoteEditorDialog mode="edit" note={makeNote()} onClose={onClose} />,
    );
    await user.click(screen.getByRole("button", { name: /delete/i }));

    expect(deleteFlowNote).toHaveBeenCalledWith("note-1");
    expect(onClose).toHaveBeenCalled();
  });
});

describe("edit mode - another author's note", () => {
  it("still allows editing and deleting, since notes are shared across the team", async () => {
    const { user } = await setup(
      <NoteEditorDialog
        mode="edit"
        note={makeNote({ createdBy: 999 })}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /delete/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /update/i })).toBeEnabled();

    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "Edited by another user");
    await user.click(screen.getByRole("button", { name: /update/i }));

    expect(updateFlowNote).toHaveBeenCalledWith(
      "note-1",
      expect.objectContaining({ text: "Edited by another user" }),
    );
  });
});

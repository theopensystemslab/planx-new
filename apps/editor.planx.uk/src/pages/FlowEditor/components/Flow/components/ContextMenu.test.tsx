import { screen } from "@testing-library/react";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { setup } from "test/utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ContextMenu } from "./ContextMenu";

beforeEach(() => {
  useStore.setState({
    contextMenuPosition: { mouseX: 10, mouseY: 10 },
    contextMenuRelationships: {},
    contextMenuSource: null,
    flow: {},
    cloneFlowNote: vi.fn(),
    copyFlowNote: vi.fn(),
    pasteFlowNoteClone: vi.fn(),
    pasteFlowNoteCopy: vi.fn(),
    getClonedFlowNoteId: () => null,
    getCopiedFlowNote: () => undefined,
  });
});

describe("positioned-note context menu", () => {
  it("offers Clone and Copy for a right-clicked note", async () => {
    useStore.setState({
      contextMenuSource: "positioned-note",
      contextMenuRelationships: { self: "position-1", contentId: "content-1" },
    });

    await setup(<ContextMenu />);

    expect(
      screen.getByRole("menuitem", { name: /clone/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /^copy$/i }),
    ).toBeInTheDocument();
  });

  it("clones using the note's shared content id, not its position id", async () => {
    useStore.setState({
      contextMenuSource: "positioned-note",
      contextMenuRelationships: { self: "position-1", contentId: "content-1" },
    });

    const { user } = await setup(<ContextMenu />);
    await user.click(screen.getByRole("menuitem", { name: /clone/i }));

    expect(useStore.getState().cloneFlowNote).toHaveBeenCalledWith("content-1");
  });

  it("copies using the note's shared content id, not its position id", async () => {
    useStore.setState({
      contextMenuSource: "positioned-note",
      contextMenuRelationships: { self: "position-1", contentId: "content-1" },
    });

    const { user } = await setup(<ContextMenu />);
    await user.click(screen.getByRole("menuitem", { name: /^copy$/i }));

    expect(useStore.getState().copyFlowNote).toHaveBeenCalledWith("content-1");
  });
});

describe("hanger context menu - paste note", () => {
  it("disables 'Paste note' when nothing is cloned or copied", async () => {
    useStore.setState({
      contextMenuSource: "hanger",
      contextMenuRelationships: { parent: "_root" },
    });

    await setup(<ContextMenu />);

    expect(
      screen.getByRole("menuitem", { name: /paste note/i }),
    ).toHaveAttribute("aria-disabled", "true");
  });

  it("pastes a clone (shared content) when a note has been cloned", async () => {
    useStore.setState({
      contextMenuSource: "hanger",
      contextMenuRelationships: { parent: "_root" },
      getClonedFlowNoteId: () => "content-1",
    });

    const { user } = await setup(<ContextMenu />);
    await user.click(screen.getByRole("menuitem", { name: /paste note/i }));

    expect(useStore.getState().pasteFlowNoteClone).toHaveBeenCalled();
    expect(useStore.getState().pasteFlowNoteCopy).not.toHaveBeenCalled();
  });

  it("pastes a copy (independent content) when a note has been copied", async () => {
    useStore.setState({
      contextMenuSource: "hanger",
      contextMenuRelationships: { parent: "_root" },
      getCopiedFlowNote: () => ({ text: "hi", color: "#fffdb0" }),
    });

    const { user } = await setup(<ContextMenu />);
    await user.click(screen.getByRole("menuitem", { name: /paste note/i }));

    expect(useStore.getState().pasteFlowNoteCopy).toHaveBeenCalled();
    expect(useStore.getState().pasteFlowNoteClone).not.toHaveBeenCalled();
  });
});

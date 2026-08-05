import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useClonedFlowNoteId } from "./useClonedFlowNoteId";
import { useCloneFlowNote } from "./useCloneFlowNote";
import { useCopiedFlowNote } from "./useCopiedFlowNote";
import { useSetCopiedFlowNote } from "./useSetCopiedFlowNote";

beforeEach(() => {
  localStorage.clear();
});

describe("useCloneFlowNote", () => {
  it("stores the cloned note's content id, clearing any copied note", () => {
    const { result: setCopied } = renderHook(() => useSetCopiedFlowNote());
    const { result: clone } = renderHook(() => useCloneFlowNote());
    const { result: clonedId } = renderHook(() => useClonedFlowNoteId());
    const { result: copied } = renderHook(() => useCopiedFlowNote());

    setCopied.current.setCopiedFlowNote({ text: "hi", color: "#fffdb0" });
    clone.current.cloneFlowNote("note-content-1");

    expect(clonedId.current.getClonedFlowNoteId()).toBe("note-content-1");
    expect(copied.current.getCopiedFlowNote()).toBeUndefined();
  });
});

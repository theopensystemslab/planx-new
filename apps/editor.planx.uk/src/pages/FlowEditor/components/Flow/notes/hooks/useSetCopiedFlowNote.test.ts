import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useClonedFlowNoteId } from "./useClonedFlowNoteId";
import { useCloneFlowNote } from "./useCloneFlowNote";
import { useCopiedFlowNote } from "./useCopiedFlowNote";
import { useSetCopiedFlowNote } from "./useSetCopiedFlowNote";

beforeEach(() => {
  localStorage.clear();
});

describe("useSetCopiedFlowNote", () => {
  it("stores the copied note's content, clearing any cloned note", () => {
    const { result: clone } = renderHook(() => useCloneFlowNote());
    const { result: setCopied } = renderHook(() => useSetCopiedFlowNote());
    const { result: clonedId } = renderHook(() => useClonedFlowNoteId());
    const { result: copied } = renderHook(() => useCopiedFlowNote());

    clone.current.cloneFlowNote("note-content-1");
    setCopied.current.setCopiedFlowNote({ text: "hi", color: "#fffdb0" });

    expect(copied.current.getCopiedFlowNote()).toEqual({
      text: "hi",
      color: "#fffdb0",
    });
    expect(clonedId.current.getClonedFlowNoteId()).toBeNull();
  });
});

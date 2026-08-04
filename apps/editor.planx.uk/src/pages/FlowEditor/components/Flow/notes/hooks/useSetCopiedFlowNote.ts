import type { CopiedFlowNoteContent } from "./useCopiedFlowNote";

/**
 * Clipboard: copying a note means the copied note will not be linked to the original note, so editing one will not affect the other.
 */
export const useSetCopiedFlowNote = () => {
  const setCopiedFlowNote = (content: CopiedFlowNoteContent) => {
    localStorage.setItem("copiedFlowNote", JSON.stringify(content));
    localStorage.removeItem("clonedFlowNoteId");
  };

  return { setCopiedFlowNote };
};

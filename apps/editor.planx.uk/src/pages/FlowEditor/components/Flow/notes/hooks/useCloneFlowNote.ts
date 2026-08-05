/**
 * Clipboard: cloning a note means clones will be linked to the original note, so editing one will affect the other.
 */
export const useCloneFlowNote = () => {
  const cloneFlowNote = (noteContentId: string) => {
    localStorage.setItem("clonedFlowNoteId", noteContentId);
    localStorage.removeItem("copiedFlowNote");
  };

  return { cloneFlowNote };
};

export interface CopiedFlowNoteContent {
  text: string;
}

export const useCopiedFlowNote = () => {
  const getCopiedFlowNote = (): CopiedFlowNoteContent | undefined => {
    const payload = localStorage.getItem("copiedFlowNote");
    return payload ? JSON.parse(payload) : undefined;
  };

  return { getCopiedFlowNote };
};

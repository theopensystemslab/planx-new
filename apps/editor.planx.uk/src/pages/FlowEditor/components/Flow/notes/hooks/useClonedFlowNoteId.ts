export const useClonedFlowNoteId = () => {
  const getClonedFlowNoteId = () => localStorage.getItem("clonedFlowNoteId");

  return { getClonedFlowNoteId };
};

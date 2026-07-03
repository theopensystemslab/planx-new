import { FlowNodeNote } from "hooks/data/useFlowNodeNotes";
import { createContext, useContext } from "react";

interface FlowNotesContextValue {
  notesForNode: (nodeId: string) => FlowNodeNote[];
}

const noOp = (): FlowNodeNote[] => [];

export const FlowNotesContext = createContext<FlowNotesContextValue>({
  notesForNode: noOp,
});

export const useFlowNotes = () => useContext(FlowNotesContext);

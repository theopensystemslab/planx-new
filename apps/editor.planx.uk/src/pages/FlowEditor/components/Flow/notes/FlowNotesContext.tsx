import { useFlowNotes } from "hooks/data/useFlowNotes";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { createContext, useContext } from "react";

import type { PartitionedNotes } from "./lib/partitionNotes";
import { partitionNotes } from "./lib/partitionNotes";

interface FlowNotesContextValue extends PartitionedNotes {
  loading: boolean;
}

const emptyContextValue: FlowNotesContextValue = {
  attached: new Map(),
  positioned: new Map(),
  loading: false,
};

export const FlowNotesContext =
  createContext<FlowNotesContextValue>(emptyContextValue);

export const useFlowNotesContext = (): FlowNotesContextValue =>
  useContext(FlowNotesContext);

export const FlowNotesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { notes, loading } = useFlowNotes();
  const flow = useStore((state) => state.flow);
  const { attached, positioned } = partitionNotes(notes, flow);

  return (
    <FlowNotesContext.Provider value={{ attached, positioned, loading }}>
      {children}
    </FlowNotesContext.Provider>
  );
};

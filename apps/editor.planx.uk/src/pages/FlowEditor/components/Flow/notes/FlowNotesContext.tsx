import { useFlowNotes } from "hooks/data/useFlowNotes";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { createContext, useContext } from "react";

import type { PartitionedNotes } from "./lib/partitionNotes";
import { getClonedNoteContentIds, partitionNotes } from "./lib/partitionNotes";

interface FlowNotesContextValue extends PartitionedNotes {
  loading: boolean;
  /** contentIds shared by more than one note position - i.e. notes that are clones of one another */
  clonedContentIds: Set<string>;
}

const emptyContextValue: FlowNotesContextValue = {
  attached: new Map(),
  positioned: new Map(),
  loading: false,
  clonedContentIds: new Set(),
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
  const clonedContentIds = getClonedNoteContentIds(notes);

  return (
    <FlowNotesContext.Provider
      value={{ attached, positioned, loading, clonedContentIds }}
    >
      {children}
    </FlowNotesContext.Provider>
  );
};

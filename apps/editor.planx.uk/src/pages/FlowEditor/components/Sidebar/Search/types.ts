import type { IndexedNode } from "@opensystemslab/planx-core/types";
import type { FlowNote } from "hooks/data/useFlowNotes";
import type { SearchResult } from "hooks/useSearch";

export type SearchableResult =
  SearchResult<IndexedNode> | SearchResult<FlowNote>;

// `positionId` is unique to FlowNote and identifies a note result
export const isNoteResult = (
  result: SearchableResult,
): result is SearchResult<FlowNote> => "positionId" in result.item;

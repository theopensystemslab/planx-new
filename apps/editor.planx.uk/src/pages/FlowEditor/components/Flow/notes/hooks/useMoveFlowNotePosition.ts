import { useMutation } from "@apollo/client";
import { useStore } from "pages/FlowEditor/lib/store";

import { resolveNotePlacement } from "../lib/notePlacement";
import { REANCHOR_FLOW_NOTE_POSITION } from "./mutations";

export const useMoveFlowNotePosition = () => {
  const [mutate, mutationState] = useMutation(REANCHOR_FLOW_NOTE_POSITION);

  const moveFlowNotePosition = async (
    positionId: string,
    container: string,
    before?: string,
  ) => {
    const flow = useStore.getState().flow;
    const placement = resolveNotePlacement(flow, container, before);

    await mutate({ variables: { id: positionId, placement } });
  };

  return { moveFlowNotePosition, ...mutationState };
};

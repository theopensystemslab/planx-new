import { NodeId } from "@opensystemslab/planx-core/types";

import { Store, useStore } from "../store";

const { getState } = useStore;
const { upcomingCardIds, record } = getState();

/**
 * @returns List of nodes ids that have been visited (seen or automated)
 */
export const visitedNodes = () => Object.keys(getState().breadcrumbs);

/**
 * Mimic clicking "Continue" button on a card and submitting user data
 */
export const clickContinue = (nodeId: NodeId, userData: Store.UserData) => {
  record(nodeId, userData);
  upcomingCardIds();
};

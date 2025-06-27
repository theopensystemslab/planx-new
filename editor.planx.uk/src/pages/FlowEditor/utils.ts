import {
  ComponentType as TYPES,
  FlowStatus,
  IndexedNode,
} from "@opensystemslab/planx-core/types";
import { formatDistanceToNow } from "date-fns";
import { FlowSettings } from "types";

import { Store } from "./lib/store";

export interface FlowInformation {
  settings: FlowSettings;
  status: FlowStatus;
  description?: string;
  summary?: string;
  limitations?: string;
  canCreateFromCopy?: boolean;
}

export interface GetFlowInformation {
  id: string;
  flows: FlowInformation[];
}

export const formatLastEditDate = (date: string): string => {
  return formatDistanceToNow(new Date(date), {
    includeSeconds: true,
    addSuffix: true,
  });
};

export const formatLastEditMessage = (
  date: string,
  actor?: { firstName: string; lastName: string },
): string => {
  if (!actor) {
    return `Last edited ${formatLastEditDate(date)}`;
  }

  const name = `${actor.firstName} ${actor.lastName}`;
  return `Last edited ${formatLastEditDate(date)} by ${name}`;
};

export const formatLastPublishMessage = (
  date?: string,
  user?: string,
): string => {
  if (!date) return "Not yet published";

  if (!user) return `Last published ${formatLastEditDate(date)}`;

  return `Last published ${formatLastEditDate(date)} by ${user}`;
};

export const formatServiceLastUpdated = (date: string): string => {
  const formattedDate = new Date(date).toLocaleDateString("en-gb");
  return `Service last updated ${formattedDate}`;
};

export const nodeIsTemplatedInternalPortal = (
  flow: Store.Flow,
  node?: IndexedNode,
): boolean => {
  if (node) {
    return (
      node.type === TYPES.InternalPortal &&
      Boolean(flow[node.id]?.data?.isTemplatedNode)
    );
  } else {
    return false;
  }
};

export const nodeIsChildOfTemplatedInternalPortal = (
  flow: Store.Flow,
  node?: IndexedNode,
): boolean => {
  if (node && node?.parentId && node?.internalPortalId) {
    return (
      (flow[node.parentId]?.type === TYPES.InternalPortal &&
        Boolean(flow[node.parentId]?.data?.isTemplatedNode)) ||
      Boolean(flow[node.internalPortalId]?.data?.isTemplatedNode)
    );
  } else {
    return false;
  }
};

export const flowIsTemplatedInternalPortal = (
  flow: Store.Flow,
  parentNode?: IndexedNode,
): boolean => {
  return parentNode ? nodeIsTemplatedInternalPortal(flow, parentNode) : false;
};

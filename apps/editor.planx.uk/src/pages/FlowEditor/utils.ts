import type { FlowStatus, IndexedNode } from "@opensystemslab/planx-core/types";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { formatDistanceToNow } from "date-fns";
import type { FlowSettings } from "types";

import type { Store } from "./lib/store";

export interface FlowInformation {
  settings: FlowSettings;
  status: FlowStatus;
  canCreateFromCopy?: boolean;
  isListedOnLPS: boolean;
  summary?: string;
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

interface DateMessage {
  timeAgo: string;
  actor?: string;
  formatted: string;
}

export const formatLastEditMessage = (
  date: string,
  actor?: { firstName: string; lastName: string },
): DateMessage => {
  const timeAgo = formatLastEditDate(date);
  const actorName = actor ? `${actor.firstName} ${actor.lastName}` : undefined;
  const withLabel = `Last edited ${timeAgo}`;
  const formatted = actorName ? `${withLabel} by ${actorName}` : withLabel;
  return {
    timeAgo,
    actor: actorName,
    formatted,
  };
};

export const formatLastPublishMessage = (
  date?: string,
  user?: string,
): DateMessage => {
  if (!date) {
    return {
      timeAgo: "Not yet published",
      actor: undefined,
      formatted: "Not yet published",
    };
  }
  const timeAgo = formatLastEditDate(date);
  const withLabel = `Last published ${timeAgo}`;
  const formatted = user ? `${withLabel} by ${user}` : withLabel;
  return {
    timeAgo,
    actor: user,
    formatted,
  };
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

export const formatServiceLastUpdated = (date: string): string => {
  const formattedDate = new Date(date).toLocaleDateString("en-gb");
  return `Service last updated ${formattedDate}`;
};

export const parentNodeIsTemplatedInternalPortal = (
  flow: Store.Flow,
  parentNode?: IndexedNode,
): boolean => {
  return parentNode ? nodeIsTemplatedInternalPortal(flow, parentNode) : false;
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

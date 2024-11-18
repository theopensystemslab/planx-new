import { FlowStatus } from "@opensystemslab/planx-core/types";
import { formatDistanceToNow } from "date-fns";
import { FlowSettings } from "types";

export interface FlowInformation {
  id?: string;
  settings: FlowSettings;
  status: FlowStatus;
  description: string;
}

export interface GetFlowSettings {
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

export const formatLastPublishMessage = (date: string, user: string): string =>
  `Last published ${formatLastEditDate(date)} by ${user}`;

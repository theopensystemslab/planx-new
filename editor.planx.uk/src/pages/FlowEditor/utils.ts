import { FlowStatus } from "@opensystemslab/planx-core/types";
import { formatDistanceToNow } from "date-fns";
import { FlowSettings } from "types";

export interface FlowInformation {
  settings: FlowSettings;
  status: FlowStatus;
  description?: string;
  summary?: string;
  limitations?: string;
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

export const formatLastPublishMessage = (date: string, user: string): string =>
  `Last published ${formatLastEditDate(date)} by ${user}`;

export const formatServiceLastUpdated = (date: string): string => {
  const formattedDate = new Date(date).toLocaleDateString("en-gb");
  return `Service last updated ${formattedDate}`;
};

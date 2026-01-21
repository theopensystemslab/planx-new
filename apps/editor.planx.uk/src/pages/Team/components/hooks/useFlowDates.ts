import { FlowSummary } from "pages/FlowEditor/lib/store/editor";

import {
  formatLastEditMessage,
  formatLastPublishMessage,
} from "../../../FlowEditor/utils";
import { useFlowSortDisplay } from "./useFlowSortDisplay";

export const useFlowDates = (flow: FlowSummary) => {
  const { showPublished } = useFlowSortDisplay();

  const publishedDate = formatLastPublishMessage(
    flow.publishedFlows[0]?.publishedAt,
  );
  const editedDate = formatLastEditMessage(
    flow.operations[0]?.createdAt,
    flow.operations[0]?.actor,
  );

  return {
    displayFormatted: showPublished
      ? publishedDate.formatted
      : editedDate.formatted,
    displayTimeAgo: showPublished ? publishedDate.timeAgo : editedDate.timeAgo,
    displayActor: showPublished ? publishedDate.actor : editedDate.actor,
  };
};

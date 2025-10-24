import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import SimpleExpand from "@planx/components/shared/Preview/SimpleExpand";
import { formatOps } from "@planx/graph";
import { CommentHistoryItem, OperationHistoryItem, PublishHistoryItem } from "api/publishFlow/types";
import { Store } from "pages/FlowEditor/lib/store";
import React from "react";
import BlockQuote from "ui/editor/BlockQuote";

import { isAutoComment } from "../utils";

/**
 * Timeline items are one of three event "types":
 *   1. Operations - most granular edits derived from JSON Operational Transforms (OTs), can be "restored to this point" aka "undone"
 *   2. Comments - manually created summary of operations, will be automatically removed if within scope of restore
 *   3. Publishes - snapshot of flattened flow data which becomes available to the public if "online", cannot be "restored" or "undone"
 *
 * Gray color scales are used to denote heirarchy of event types and their available actions
 */

const TimeLineItem = styled(Box)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  border: `1px solid rgba(0,0,0,0.08)`,
}));

const EditHistoryListItem = styled("li")(() => ({
  listStyleType: "square",
  overflowWrap: "break-word",
  wordWrap: "break-word",
}));

interface OperationTimelineItemProps {
  event: OperationHistoryItem;
  i: number;
  inUndoScope: (i: number) => boolean;
  flow: Store.Flow;
}

export const OperationTimelineItem = ({
  event,
  i,
  inUndoScope,
  flow,
}: OperationTimelineItemProps) => {
  // A single operation may contain many individual edits
  //  If greater than OPS_TO_DISPLAY, truncate and expand to display all
  const OPS_TO_DISPLAY = 5;

  // Skip initial "Created flow" operation with data = {}
  if (!event.data) {
    return null;
  }

  return (
    <TimeLineItem sx={{ bgcolor: (theme) => theme.palette.info.light }}>
      <Typography
        variant="body3"
        component="ul"
        padding={1.5}
        paddingLeft={3}
        color={inUndoScope(i) ? "GrayText" : "inherit"}
      >
        {[...new Set(formatOps(flow, event.data))]
          .slice(0, OPS_TO_DISPLAY)
          .map((formattedOp, i) => (
            <EditHistoryListItem key={i}>{formattedOp}</EditHistoryListItem>
          ))}
      </Typography>
      {[...new Set(formatOps(flow, event.data))].length > OPS_TO_DISPLAY && (
        <SimpleExpand
          id="edits-overflow"
          buttonText={{
            open: `Show ${
              [...new Set(formatOps(flow, event.data))].length - OPS_TO_DISPLAY
            } more`,
            closed: "Show less",
          }}
          lightFontStyle={true}
        >
          <Typography
            variant="body3"
            component="ul"
            padding={2}
            paddingLeft={3.5}
            color={inUndoScope(i) ? "GrayText" : "inherit"}
            style={{ paddingRight: "50px" }}
          >
            {[...new Set(formatOps(flow, event.data))]
              .slice(OPS_TO_DISPLAY)
              ?.map((formattedOp, i) => (
                <EditHistoryListItem key={i}>{formattedOp}</EditHistoryListItem>
              ))}
          </Typography>
        </SimpleExpand>
      )}
    </TimeLineItem>
  );
};

interface CommentTimelineItemProps {
  event: CommentHistoryItem;
  i: number;
  inUndoScope: (i: number) => boolean;
}

export const CommentTimelineItem = ({
  event,
  i,
  inUndoScope,
}: CommentTimelineItemProps) => (
  <TimeLineItem
    bgcolor={(theme) => {
      if (inUndoScope(i)) {
        return theme.palette.grey[100];
      } else if (isAutoComment(event.comment)) {
        return theme.palette.template.main;
      } else {
        return theme.palette.secondary.dark;
      }
    }}
    color={inUndoScope(i) ? "GrayText" : "inherit"}
    p={1}
  >
    <BlockQuote>{` ${event.comment}`}</BlockQuote>
  </TimeLineItem>
);

interface PublishTimelineItemProps {
  event: PublishHistoryItem;
}

export const PublishTimelineItem = ({ event }: PublishTimelineItemProps) => (
  <TimeLineItem
    bgcolor={(theme) => theme.palette.background.dark}
    color="white"
    p={1}
  >
    <BlockQuote>{event.comment || ""}</BlockQuote>
  </TimeLineItem>
);

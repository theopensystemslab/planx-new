import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import type { CommentHistoryItem, OperationHistoryItem, PublishHistoryItem } from ".";
import SimpleExpand from "@planx/components/shared/Preview/SimpleExpand";
import { formatOps } from "@planx/graph";
import { Store } from "pages/FlowEditor/lib/store";
import { styled } from "@mui/material/styles";

/**
 * Timeline items are one of three event "types":
 *   1. Operations - most granular edits derived from JSON Operational Transforms (OTs), can be "restored to this point" aka "undone"
 *   2. Comments - manually created summary of operations, will be automatically removed if within scope of restore
 *   3. Publishes - snapshot of flattened flow data which becomes available to the public if "online", cannot be "restored" or "undone"
 * 
 * Gray color scales are used to denote heirarchy of event types and their available actions
 */

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

export const OperationTimelineItem = ({ event, i, inUndoScope, flow }: OperationTimelineItemProps) => {
  // A single operation may contain many individual edits
  //  If greater than OPS_TO_DISPLAY, truncate and expand to display all
  const OPS_TO_DISPLAY = 5;

  // Skip initial "Created flow" operation with data = {}
  if (!event.data) {
    return null;
  }

  return (
    <Box sx={{ bgcolor: (theme) => theme.palette.grey[100], borderRadius: "8px" }}>
      <Typography
        variant="body2"
        component="ul"
        padding={2}
        paddingLeft={3.5}
        color={inUndoScope(i) ? "GrayText" : "inherit"}
      >
        {[...new Set(formatOps(flow, event.data))]
          .slice(0, OPS_TO_DISPLAY)
          .map((formattedOp, i) => (
            <EditHistoryListItem key={i}>
              {formattedOp}
            </EditHistoryListItem>
          ))}
      </Typography>
      {[...new Set(formatOps(flow, event.data))].length >
        OPS_TO_DISPLAY && (
          <SimpleExpand
            id="edits-overflow"
            buttonText={{
              open: `Show ${[...new Set(formatOps(flow, event.data))].length -
                OPS_TO_DISPLAY
                } more`,
              closed: "Show less",
            }}
            lightFontStyle={true}
          >
            <Typography
              variant="body2"
              component="ul"
              padding={2}
              paddingLeft={3.5}
              color={inUndoScope(i) ? "GrayText" : "inherit"}
              style={{ paddingRight: "50px" }}
            >
              {[...new Set(formatOps(flow, event.data))]
                .slice(OPS_TO_DISPLAY)
                ?.map((formattedOp, i) => (
                  <EditHistoryListItem key={i}>
                    {formattedOp}
                  </EditHistoryListItem>
                ))}
            </Typography>
          </SimpleExpand>
        )}
    </Box>
  );
}

interface CommentTimelineItemProps {
  event: CommentHistoryItem;
  i: number;
  inUndoScope: (i: number) => boolean;
}

export const CommentTimelineItem = ({ event, i, inUndoScope }: CommentTimelineItemProps) => (
  <Box bgcolor={(theme) => inUndoScope(i) ? "#F0F3F6" : theme.palette.grey[400]} sx={{ borderRadius: "8px" }}>
    <Typography variant="body2" color={inUndoScope(i) ? "GrayText" : "inherit"} padding={2}>
      {`[Commented] ${event.comment}`}
    </Typography>
  </Box>
);

interface PublishTimelineItemProps {
  event: PublishHistoryItem;
}

export const PublishTimelineItem = ({ event }: PublishTimelineItemProps) => (
  <Box bgcolor={(theme) => theme.palette.text.primary} sx={{ borderRadius: "8px" }}>
    <Typography variant="body2" color="#fff" padding={2}>
      {`[Published] ${Boolean(event.comment) ? event.comment : ""}`}
    </Typography>
  </Box>
);

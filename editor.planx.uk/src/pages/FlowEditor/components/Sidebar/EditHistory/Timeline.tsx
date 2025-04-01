import RestoreOutlined from "@mui/icons-material/RestoreOutlined";
import Timeline from "@mui/lab/Timeline";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem, { timelineItemClasses } from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { OT } from "@planx/graph/types";
import { useStore } from "pages/FlowEditor/lib/store";
import { formatLastEditDate } from "pages/FlowEditor/utils";
import React, { useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

import {
  CommentHistoryItem,
  HistoryItem,
  OperationHistoryItem,
  PublishHistoryItem,
} from ".";
import {
  CommentTimelineItem,
  OperationTimelineItem,
  PublishTimelineItem,
} from "./TimelineItems";

interface EditHistoryTimelineProps {
  events: HistoryItem[];
}

export const EditHistoryTimeline = ({
  events = [],
}: EditHistoryTimelineProps) => {
  const [focusedOpIndex, setFocusedOpIndex] = useState<number | undefined>(
    undefined,
  );

  const [flow, teamSlug, canUserEditTeam, undoOperation, deleteFlowComment] =
    useStore((state) => [
      state.flow,
      state.teamSlug,
      state.canUserEditTeam,
      state.undoOperation,
      state.deleteFlowComment,
    ]);

  const handleUndo = (i: number) => {
    // Get all events since & including the selected one
    const eventsToUndo = events.slice(0, i + 1);

    const operationsToUndo = eventsToUndo.filter(
      (event) => event.type === "operation",
    ) as OperationHistoryItem[];
    const commentsToDelete = eventsToUndo.filter(
      (event) => event.type === "comment",
    ) as CommentHistoryItem[];

    // Make a flattened list of operations, with the latest operations first
    const operationsData: Array<OT.Op[]> = [];
    operationsToUndo.map((op) => operationsData.unshift(op.data));
    const flattenedOperationsData: OT.Op[] = operationsData?.flat(1);

    // Then undo all operations by applying a single new inverse operation on top
    undoOperation(flattenedOperationsData);

    // Also delete each comment in the undo scope
    commentsToDelete.forEach(async (comment) => {
      await deleteFlowComment(comment.id);
    });
  };

  const inUndoScope = (i: number): boolean => {
    // Is a given operation in the list in scope of also being "undone" if the currently focused button is clicked?
    return focusedOpIndex !== undefined && i < focusedOpIndex;
  };

  const isUndoType = (type: HistoryItem["type"]): boolean => {
    // Only operations and comments will be "undone" when restoring to a point in time, publishes are permanent snapshots
    return ["operation", "comment"].includes(type);
  };

  const showUndoButton = (event: HistoryItem): boolean => {
    // Only show the restore button for operations within teams I can edit, omitting the intial default operation for new flows which won't have an actor
    return (
      event.type === "operation" &&
      Boolean(event.actorId) &&
      canUserEditTeam(teamSlug)
    );
  };

  return (
    <Timeline
      sx={{
        padding: 0,
        [`& .${timelineItemClasses.root}:before`]: {
          flex: 0,
          padding: 0,
        },
      }}
    >
      {events?.map((op: HistoryItem, i: number) => (
        <TimelineItem key={`${op.type}-${op.id}`}>
          <TimelineSeparator>
            <TimelineDot
              sx={{
                bgcolor: (theme) =>
                  inUndoScope(i) && isUndoType(op.type)
                    ? theme.palette.grey[300]
                    : theme.palette.grey[900],
              }}
            />
            {i < events?.length - 1 && (
              <TimelineConnector
                sx={{
                  bgcolor: (theme) =>
                    inUndoScope(i) && isUndoType(op.type)
                      ? theme.palette.grey[200]
                      : theme.palette.grey[300],
                }}
              />
            )}
          </TimelineSeparator>
          <TimelineContent
            sx={{
              paddingBottom: 1.5,
              minWidth: "100%",
              maxWidth: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
                  color={
                    inUndoScope(i) && isUndoType(op.type)
                      ? "GrayText"
                      : "inherit"
                  }
                >
                  {`${
                    op.actorId
                      ? `${op.firstName} ${op.lastName}`
                      : `Created flow`
                  }`}
                </Typography>
                <Typography
                  variant="body2"
                  fontSize="small"
                  pt={0.25}
                  pb={0.75}
                  color={
                    inUndoScope(i) && isUndoType(op.type)
                      ? "GrayText"
                      : "text.secondary"
                  }
                >
                  <strong>{`${
                    {
                      publish: "Published",
                      comment: "Commented",
                      operation: "Edited",
                    }[op.type]
                  }`}</strong>{" "}
                  {`${formatLastEditDate(op.createdAt)}`}
                </Typography>
              </Box>
              {showUndoButton(op) && (
                <Tooltip title="Restore to this point" placement="left">
                  <IconButton
                    aria-label="Restore to this point"
                    onClick={() => handleUndo(i)}
                    onMouseEnter={() => setFocusedOpIndex(i)}
                    onMouseLeave={() => setFocusedOpIndex(undefined)}
                  >
                    <RestoreOutlined
                      fontSize="large"
                      color={
                        inUndoScope(i) && isUndoType(op.type)
                          ? "inherit"
                          : "primary"
                      }
                    />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            {
              {
                operation: (
                  <OperationTimelineItem
                    event={op as OperationHistoryItem}
                    i={i}
                    inUndoScope={inUndoScope}
                    flow={flow}
                  />
                ),
                comment: (
                  <CommentTimelineItem
                    event={op as CommentHistoryItem}
                    i={i}
                    inUndoScope={inUndoScope}
                  />
                ),
                publish: (
                  <PublishTimelineItem event={op as PublishHistoryItem} />
                ),
              }[op.type]
            }
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

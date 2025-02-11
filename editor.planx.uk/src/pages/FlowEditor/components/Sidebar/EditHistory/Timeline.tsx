import RestoreOutlined from "@mui/icons-material/RestoreOutlined";
import Timeline from "@mui/lab/Timeline";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem, { timelineItemClasses } from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import SimpleExpand from "@planx/components/shared/Preview/SimpleExpand";
import { formatOps } from "@planx/graph";
import { OT } from "@planx/graph/types";
import capitalize from "lodash/capitalize";
import { useStore } from "pages/FlowEditor/lib/store";
import { formatLastEditDate } from "pages/FlowEditor/utils";
import React, { useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { Operation } from "types";
import { HistoryItem } from ".";

const EditHistoryListItem = styled("li")(() => ({
  listStyleType: "square",
  overflowWrap: "break-word",
  wordWrap: "break-word",
}));

interface EditHistoryTimelineProps {
  data?: HistoryItem[];
}

export const EditHistoryTimeline = ({ data = [] }: EditHistoryTimelineProps) => {
  // A single operation (timeline list item) may contain many individual edits
  //  If greater than OPS_TO_DISPLAY, truncate and expand to display all
  const OPS_TO_DISPLAY = 5;

  const [focusedOpIndex, setFocusedOpIndex] = useState<number | undefined>(
    undefined,
  );

  const [flow, canUserEditTeam, teamSlug, undoOperation] = useStore(
    (state) => [
      state.flow,
      state.canUserEditTeam,
      state.teamSlug,
      state.undoOperation,
    ],
  );

  const handleUndo = (i: number) => {
    // Get all operations _since_ & including the selected one
    const operationsToUndo = data.slice(0, i + 1);

    // Make a flattened list, with the latest operations first
    const operationsData: Array<OT.Op[]> = [];
    operationsToUndo?.filter((op) => op.type === "operation" && op.data)?.map((op) => operationsData.unshift(op.data as Operation["data"]));
    const flattenedOperationsData: OT.Op[] = operationsData?.flat(1);

    // Undo all
    undoOperation(flattenedOperationsData);
  };

  const inUndoScope = (i: number): boolean => {
    // Is a given operation in the list in scope of also being "undone" if the currently focused button is clicked?
    return focusedOpIndex !== undefined && i < focusedOpIndex;
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
      {data?.map((op: HistoryItem, i: number) => (
        <TimelineItem key={op.id}>
          <TimelineSeparator>
            <TimelineDot
              sx={{
                bgcolor: (theme) =>
                  inUndoScope(i)
                    ? theme.palette.grey[300]
                    : theme.palette.grey[900],
              }}
            />
            {i < data?.length - 1 && (
              <TimelineConnector
                sx={{
                  bgcolor: (theme) =>
                    inUndoScope(i)
                      ? theme.palette.grey[200]
                      : theme.palette.grey[300],
                }}
              />
            )}
          </TimelineSeparator>
          <TimelineContent
            sx={{
              paddingRight: 0,
              paddingTop: 0.1,
              paddingBottom: 2,
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
                  variant="body1"
                  sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
                  color={inUndoScope(i) ? "GrayText" : "inherit"}
                  py={0.33}
                >
                  {`${op.actorId
                    ? `${op.firstName} ${op.lastName}`
                    : `Created flow`
                    }`}
                </Typography>
                <Typography
                  variant="body2"
                  fontSize="small"
                  pb={0.75}
                  color={inUndoScope(i) ? "GrayText" : "text.secondary"}
                >
                  {formatLastEditDate(op.createdAt)}
                </Typography>
              </Box>
              {i > 0 && op.type === "operation" && op.actorId && canUserEditTeam(teamSlug) && (
                <Tooltip title="Restore to this point" placement="left">
                  <IconButton
                    aria-label="Restore to this point"
                    onClick={() => handleUndo(i)}
                    onMouseEnter={() => setFocusedOpIndex(i)}
                    onMouseLeave={() => setFocusedOpIndex(undefined)}
                  >
                    <RestoreOutlined
                      fontSize="large"
                      color={inUndoScope(i) ? "inherit" : "primary"}
                    />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            {op.data && (
              <Box sx={{ bgcolor: "#F0F3F6", borderRadius: "8px" }}>
                <Typography
                  variant="body2"
                  component="ul"
                  padding={2}
                  paddingLeft={3.5}
                  color={inUndoScope(i) ? "GrayText" : "inherit"}
                >
                  {[...new Set(formatOps(flow, op.data))]
                    .slice(0, OPS_TO_DISPLAY)
                    .map((formattedOp, i) => (
                      <EditHistoryListItem key={i}>
                        {formattedOp}
                      </EditHistoryListItem>
                    ))}
                </Typography>
                {[...new Set(formatOps(flow, op.data))].length >
                  OPS_TO_DISPLAY && (
                    <SimpleExpand
                      id="edits-overflow"
                      buttonText={{
                        open: `Show ${[...new Set(formatOps(flow, op.data))].length -
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
                        {[...new Set(formatOps(flow, op.data))]
                          .slice(OPS_TO_DISPLAY)
                          .map((formattedOp, i) => (
                            <EditHistoryListItem key={i}>
                              {formattedOp}
                            </EditHistoryListItem>
                          ))}
                      </Typography>
                    </SimpleExpand>
                  )}
              </Box>
            )}
            {op.comment && (
              <Box bgcolor={inUndoScope(i) ? "#F0F3F6" : "#0B0C0C" } sx={{ borderRadius: "8px" }}>
                <Typography variant="body2" color={inUndoScope(i) ? "GrayText" : "#fff"} padding={2}>
                  {`[${capitalize(op.type)}ed] ${op.comment}`}
                </Typography>
              </Box>
            )}
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}

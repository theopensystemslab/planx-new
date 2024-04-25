import { gql, useSubscription } from "@apollo/client";
import RestoreOutlined from "@mui/icons-material/RestoreOutlined";
import Timeline from "@mui/lab/Timeline";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem, { timelineItemClasses } from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses, TooltipProps } from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import SimpleExpand from "@planx/components/shared/Preview/SimpleExpand";
import { formatOps } from "@planx/graph";
import { OT } from "@planx/graph/types";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import React, { useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

import { formatLastEditDate } from "..";
import { useStore } from "../lib/store";
import { Operation } from "types";

const TooltipWrap = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} placement="left-start" classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.dark,
    fontSize: "0.8em",
    borderRadius: 0,
    fontWeight: FONT_WEIGHT_SEMI_BOLD,
  },
}));

const HistoryListItem = styled("li")(() => ({
  listStyleType: "square",
  overflowWrap: "break-word",
  wordWrap: "break-word",
}));

const EditHistory = () => {
  const OPS_TO_DISPLAY = 5;

  const [focusedOpIndex, setFocusedOpIndex] = useState<number | undefined>(
    undefined,
  );

  const [flowId, flow, canUserEditTeam, teamSlug, undoOperation] = useStore(
    (state) => [
      state.id,
      state.flow,
      state.canUserEditTeam,
      state.teamSlug,
      state.undoOperation,
    ],
  );

  const { data, loading, error } = useSubscription<{ operations: Operation[] }>(
    gql`
      subscription GetRecentOperations($flow_id: uuid = "") {
        operations(
          limit: 15
          where: { flow_id: { _eq: $flow_id } }
          order_by: { created_at: desc }
        ) {
          id
          createdAt: created_at
          actor {
            id
            firstName: first_name
            lastName: last_name
          }
          data(path: "op")
        }
      }
    `,
    {
      variables: {
        flow_id: flowId,
      },
    },
  );

  if (error) {
    console.log(error.message);
    return null;
  }

  // Handle missing operations (e.g. non-production data)
  if (!loading && !data?.operations) return null;

  const handleUndo = (i: number) => {
    // Get all operations _since_ & including the selected one
    const operationsToUndo = data?.operations?.slice(0, i + 1);

    // Make a flattened list, with the latest operations first
    const operationsData: Array<OT.Op[]> = [];
    operationsToUndo?.map((op) => operationsData.unshift(op?.data));
    const flattenedOperationsData: OT.Op[] = operationsData?.flat(1);

    // Undo all
    undoOperation(flattenedOperationsData);
  };

  const inUndoScope = (i: number): boolean => {
    // Is a given operation in the list in scope of also being "undone" if the currently focused button is clicked?
    return focusedOpIndex !== undefined && i < focusedOpIndex;
  };

  return (
    <Box>
      {loading && !data ? (
        <DelayedLoadingIndicator
          msDelayBeforeVisible={0}
          text="Fetching edit history..."
        />
      ) : (
        <>
          <Timeline
            sx={{
              padding: 0,
              [`& .${timelineItemClasses.root}:before`]: {
                flex: 0,
                padding: 0,
              },
            }}
          >
            {data?.operations?.map((op: Operation, i: number) => (
              <TimelineItem key={op.id}>
                <TimelineSeparator>
                  <TimelineDot
                    sx={{
                      bgcolor: (theme) =>
                        inUndoScope(i)
                          ? theme.palette.grey[400]
                          : theme.palette.grey[900],
                    }}
                  />
                  {i < data.operations.length - 1 && (
                    <TimelineConnector
                      sx={{
                        bgcolor: (theme) =>
                          inUndoScope(i)
                            ? theme.palette.grey[400]
                            : theme.palette.grey[900],
                      }}
                    />
                  )}
                </TimelineSeparator>
                <TimelineContent
                  sx={{
                    paddingRight: 0,
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
                      >
                        {`${
                          op.actor
                            ? `Edited by ${op.actor?.firstName} ${op.actor?.lastName}`
                            : `Created flow`
                        }`}
                      </Typography>
                      <Typography
                        variant="body2"
                        color={inUndoScope(i) ? "GrayText" : "inherit"}
                      >
                        {formatLastEditDate(op.createdAt)}
                      </Typography>
                    </Box>
                    {i > 0 && op.actor && canUserEditTeam(teamSlug) && (
                      <TooltipWrap title="Restore to this point">
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
                      </TooltipWrap>
                    )}
                  </Box>
                  {op.data && (
                    <>
                      <Typography
                        variant="body2"
                        component="ul"
                        padding={2}
                        color={inUndoScope(i) ? "GrayText" : "inherit"}
                        style={{ paddingRight: "50px" }}
                      >
                        {[...new Set(formatOps(flow, op.data))]
                          .slice(0, OPS_TO_DISPLAY)
                          .map((formattedOp, i) => (
                            <HistoryListItem key={i}>
                              {formattedOp}
                            </HistoryListItem>
                          ))}
                      </Typography>
                      {[...new Set(formatOps(flow, op.data))].length >
                        OPS_TO_DISPLAY && (
                        <SimpleExpand
                          id="edits-overflow"
                          buttonText={{
                            open: `Show ${
                              [...new Set(formatOps(flow, op.data))].length -
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
                            color={inUndoScope(i) ? "GrayText" : "inherit"}
                            style={{ paddingRight: "50px" }}
                          >
                            {[...new Set(formatOps(flow, op.data))]
                              .slice(OPS_TO_DISPLAY)
                              .map((formattedOp, i) => (
                                <HistoryListItem key={i}>
                                  {formattedOp}
                                </HistoryListItem>
                              ))}
                          </Typography>
                        </SimpleExpand>
                      )}
                    </>
                  )}
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
          {data?.operations.length === 15 && (
            <>
              <Divider />
              <Typography variant="body2" mt={2} color="GrayText">
                {`History shows the last 15 edits made to this service. If you have questions about restoring to an earlier point in time, please contact a PlanX developer.`}
              </Typography>
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default EditHistory;

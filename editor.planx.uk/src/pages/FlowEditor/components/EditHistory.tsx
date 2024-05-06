import { gql, useSubscription } from "@apollo/client";
import RestoreOutlined from "@mui/icons-material/RestoreOutlined";
import Timeline from "@mui/lab/Timeline";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem, { timelineItemClasses } from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import SimpleExpand from "@planx/components/shared/Preview/SimpleExpand";
import { formatOps } from "@planx/graph";
import { OT } from "@planx/graph/types";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import React, { useState } from "react";

import { formatLastEditDate,Operation } from "..";
import { useStore } from "../lib/store";

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

  const inFocus = (i: number): boolean => {
    return focusedOpIndex !== undefined && i < focusedOpIndex;
  };

  return (
    <Box>
      {loading && !data ? (
        <DelayedLoadingIndicator />
      ) : (
        <Timeline
          sx={{
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
                      inFocus(i) ? undefined : theme.palette.grey[900],
                  }}
                />
                {i < data.operations.length - 1 && (
                  <TimelineConnector
                    sx={{
                      bgcolor: (theme) =>
                        inFocus(i) ? undefined : theme.palette.grey[900],
                    }}
                  />
                )}
              </TimelineSeparator>
              <TimelineContent>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600 }}
                      color={inFocus(i) ? "GrayText" : "inherit"}
                    >
                      {`${
                        op.actor
                          ? `Edited by ${op.actor?.firstName} ${op.actor?.lastName}`
                          : `Created flow`
                      }`}
                    </Typography>
                    <Typography
                      variant="body2"
                      color={inFocus(i) ? "GrayText" : "inherit"}
                    >
                      {formatLastEditDate(op.createdAt)}
                    </Typography>
                  </Box>
                  {i > 0 && op.actor && canUserEditTeam(teamSlug) && (
                    <IconButton
                      title="Restore to this point"
                      aria-label="Restore to this point"
                      onClick={() => handleUndo(i)}
                      onMouseEnter={() => setFocusedOpIndex(i)}
                      onMouseLeave={() => setFocusedOpIndex(undefined)}
                    >
                      <RestoreOutlined
                        fontSize="large"
                        color={inFocus(i) ? "inherit" : "primary"}
                      />
                    </IconButton>
                  )}
                </Box>
                {op.data && (
                  <>
                    <Typography
                      variant="body2"
                      component="ul"
                      padding={2}
                      color={inFocus(i) ? "GrayText" : "inherit"}
                    >
                      {[...new Set(formatOps(flow, op.data))]
                        .slice(0, OPS_TO_DISPLAY)
                        .map((formattedOp, i) => (
                          <li key={i}>{formattedOp}</li>
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
                          color={inFocus(i) ? "GrayText" : "inherit"}
                        >
                          {[...new Set(formatOps(flow, op.data))]
                            .slice(OPS_TO_DISPLAY)
                            .map((formattedOp, i) => (
                              <li key={i}>{formattedOp}</li>
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
      )}
    </Box>
  );
};

export default EditHistory;

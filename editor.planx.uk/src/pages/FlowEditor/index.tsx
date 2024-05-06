import "./components/Settings";
import "./floweditor.scss";

import { gql, useSubscription } from "@apollo/client";
import EditNoteIcon from "@mui/icons-material/EditNote";
import RestoreOutlined from "@mui/icons-material/RestoreOutlined";
import Timeline from "@mui/lab/Timeline";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem, { timelineItemClasses } from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import SimpleExpand from "@planx/components/shared/Preview/SimpleExpand";
import { formatOps } from "@planx/graph";
import { OT } from "@planx/graph/types";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { formatDistanceToNow } from "date-fns";
import React, { useRef, useState } from "react";

import { rootFlowPath } from "../../routes/utils";
import Flow from "./components/Flow";
import PreviewBrowser from "./components/PreviewBrowser";
import { useStore } from "./lib/store";
import useScrollControlsAndRememberPosition from "./lib/useScrollControlsAndRememberPosition";

export interface Operation {
  id: number;
  createdAt: string;
  actor?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  data: Array<OT.Op>;
}

const formatLastEditDate = (date: string): string => {
  return formatDistanceToNow(new Date(date), {
    includeSeconds: true,
    addSuffix: true,
  });
};
const EditorContainer = styled(Box)(() => ({
  display: "flex",
  alignItems: "stretch",
  overflow: "hidden",
  flexGrow: 1,
}));

const formatLastEditMessage = (
  date: string,
  actor?: { firstName: string; lastName: string },
): string => {
  if (!actor) {
    return `Last edited ${formatLastEditDate(date)}`;
  }

  const name = `${actor.firstName} ${actor.lastName}`;
  return `Last edited ${formatLastEditDate(date)} by ${name}`;
};

export const LastEdited = () => {
  const [flowId] = useStore((state) => [state.id]);

  const { data, loading, error } = useSubscription<{ operations: Operation[] }>(
    gql`
      subscription GetMostRecentOperation($flow_id: uuid = "") {
        operations(
          limit: 1
          where: { flow_id: { _eq: $flow_id } }
          order_by: { created_at: desc }
        ) {
          id
          createdAt: created_at
          actor {
            firstName: first_name
            lastName: last_name
          }
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
  if (data && !data.operations[0].actor) return null;

  let message: string;
  if (loading || !data) {
    message = "Loading...";
  } else {
    const {
      operations: [operation],
    } = data;
    message = formatLastEditMessage(operation?.createdAt, operation?.actor);
  }

  return (
    <Box
      sx={(theme) => ({
        backgroundColor: theme.palette.grey[200],
        borderBottom: `1px solid ${theme.palette.border.main}`,
        padding: theme.spacing(0.5, 1),
        paddingLeft: theme.spacing(2),
        display: "flex",
        alignItems: "center",
        [theme.breakpoints.up("md")]: {
          paddingLeft: theme.spacing(2),
        },
      })}
    >
      <Typography variant="body2" fontSize="small">
        {message}
      </Typography>
      <Link
        variant="body2"
        fontSize="small"
        fontWeight="600"
        ml={2}
        sx={{ display: "flex", alignItems: "center" }}
      >
        <EditNoteIcon /> View edit history
      </Link>
    </Box>
  );
};

export const EditHistory = () => {
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

const FlowEditor: React.FC<any> = ({ flow, breadcrumbs }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useScrollControlsAndRememberPosition(scrollContainerRef);
  const showPreview = useStore((state) => state.showPreview);

  return (
    <EditorContainer id="editor-container">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          overflowX: "auto",
        }}
      >
        <LastEdited />
        <Box id="editor" ref={scrollContainerRef} sx={{ position: "relative" }}>
          <Flow flow={flow} breadcrumbs={breadcrumbs} />
        </Box>
      </Box>
      {showPreview && (
        <PreviewBrowser
          url={`${window.location.origin}${rootFlowPath(false)}/published`}
        />
      )}
    </EditorContainer>
  );
};

export default FlowEditor;

import "./components/Settings";
import "./floweditor.scss";

import { gql, useSubscription } from "@apollo/client";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { formatOps } from "@planx/graph";
import { OT } from "@planx/graph/types";
import { formatDistanceToNow } from "date-fns";
import React, { useRef } from "react";

import UndoOutlined from "@mui/icons-material/UndoOutlined";
import Divider from "@mui/material/Divider";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import Flow from "./components/Flow";
import { useStore } from "./lib/store";
import useScrollControlsAndRememberPosition from "./lib/useScrollControlsAndRememberPosition";
import { themeObject } from "themes/frontend";

interface Operation {
  createdAt: string;
  actor?: {
    firstName: string;
    lastName: string;
  };
  data: Array<OT.Op>;
}

export const LastEdited = () => {
  const [flowId, flow] = useStore((state) => [state.id, state.flow]);

  const { data, loading, error } = useSubscription<{ operations: Operation[] }>(
    gql`
      subscription GetMostRecentOperation($flow_id: uuid = "") {
        operations(
          limit: 1
          where: { flow_id: { _eq: $flow_id } }
          order_by: { updated_at: desc }
        ) {
          createdAt: created_at
          actor {
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
  if (data && !data.operations[0].actor) return null;

  let message: string;
  let ops: Operation["data"] | undefined;
  let formattedOps: string[] | undefined;

  if (loading || !data) {
    message = "Loading...";
    ops = undefined;
    formattedOps = undefined;
  } else {
    const {
      operations: [operation],
    } = data;
    message = `Last edited ${formatDistanceToNow(new Date(operation?.createdAt))} ago by ${operation?.actor?.firstName} ${operation?.actor?.lastName}`;
    ops = operation?.data;
    formattedOps = formatOps(flow, ops);
  }

  return (
    <Box
      sx={(theme) => ({
        // backgroundColor: theme.palette.background.paper,
        // borderBottom: `1px solid ${theme.palette.border.main}`,
        padding: theme.spacing(1),
        paddingLeft: theme.spacing(2),
        [theme.breakpoints.up("md")]: {
          paddingLeft: theme.spacing(3),
        },
      })}
    >
      <Typography variant="body2" fontSize="small">
        {message}
      </Typography>
      {/* {hasFeatureFlag("UNDO") && formattedOps && (
        <Typography component="ul" pl={2}>
          {[...new Set(formattedOps)].map((op, i) => (
            <Typography variant="body2" fontSize="small" component="li" key={i}>
              {op}
            </Typography>
          ))}
        </Typography>
      )} */}
    </Box>
  );
};

export const EditHistory = () => {
  const [flowId, flow] = useStore((state) => [state.id, state.flow]);

  const { data, loading, error } = useSubscription<{ operations: Operation[] }>(
    gql`
      subscription GetMostRecentOperation($flow_id: uuid = "") {
        operations(
          limit: 5
          where: { flow_id: { _eq: $flow_id } }
          order_by: { updated_at: desc }
        ) {
          createdAt: created_at
          actor {
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

  return (
    <Box
      sx={(theme) => ({
        borderLeft: `1px solid ${theme.palette.border.main}`,
        padding: theme.spacing(2),
        width: "600px",
      })}
    >
      {loading && !data ? <DelayedLoadingIndicator /> : (
        data?.operations?.map((op: Operation, i: number) => (
          <Box sx={{ marginBottom: 2 }} key={`container-${i}`}>
            <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {`Edited ${formatDistanceToNow(new Date(op.createdAt))} ago`}
                </Typography>
                {op.actor && (
                  <Typography variant="body2">
                    {`by ${op.actor?.firstName} ${op.actor?.lastName}`}
                  </Typography>
                )}
              </Box>
              <UndoOutlined titleAccess="Undo this edit" />
            </Box>
            <Typography variant="body2" component="ul" sx={{ padding: 2 }}>
              {op.data && [...new Set(formatOps(flow, op.data))].map((formattedOp, i) => (
                <li key={i}>{formattedOp}</li>
              ))}
            </Typography>
            <Divider />
          </Box>
        ))
      )}
    </Box>
  );
};

const FlowEditor: React.FC<any> = ({ flow, breadcrumbs }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useScrollControlsAndRememberPosition(scrollContainerRef);
  const showPreview = useStore((state) => state.showPreview);

  return (
    <Box id="editor-container">
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
      <EditHistory />
      {/* {showPreview && (
        <PreviewBrowser
          url={`${window.location.origin}${rootFlowPath(false)}/draft`}
        />
      )} */}
    </Box>
  );
};

export default FlowEditor;

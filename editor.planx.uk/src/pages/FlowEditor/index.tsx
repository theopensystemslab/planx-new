import "./components/Settings";
import "./floweditor.scss";

import { gql, useSubscription } from "@apollo/client";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { formatOps } from "@planx/graph";
import { format } from "date-fns";
import { hasFeatureFlag } from "lib/featureFlags";
import React, { useRef } from "react";

import { rootFlowPath } from "../../routes/utils";
import Flow from "./components/Flow";
import PreviewBrowser from "./components/PreviewBrowser";
import { useStore } from "./lib/store";
import useScrollControlsAndRememberPosition from "./lib/useScrollControlsAndRememberPosition";

interface Operation {
  createdAt: string;
  actor?: {
    firstName: string;
    lastName: string;
  };
  data: Record<string, any>[]; // consider OT types via src/@planx/graph in future
}

export const LastEdited = () => {
  const [flowId, flow] = useStore((state) => [state.id, state.flow]);

  const formattedDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return format(date, "HH:mm:ss, dd LLL yy");
  };

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
    message = `Last edit by ${operation?.actor?.firstName} ${operation?.actor
      ?.lastName} ${formattedDate(operation?.createdAt)}`;
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
      {hasFeatureFlag("UNDO") && formattedOps && (
        <Typography component="ul" pl={2}>
          {[...new Set(formattedOps)].map((op, i) => (
            <Typography variant="body2" fontSize="small" component="li" key={i}>
              {op}
            </Typography>
          ))}
        </Typography>
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
      {showPreview && (
        <PreviewBrowser
          url={`${window.location.origin}${rootFlowPath(false)}/published`}
        />
      )}
    </Box>
  );
};

export default FlowEditor;

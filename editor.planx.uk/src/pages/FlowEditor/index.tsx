import "./components/Settings";
import "./floweditor.scss";

import { gql, useSubscription } from "@apollo/client";
import UndoOutlined from "@mui/icons-material/UndoOutlined";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { formatOps } from "@planx/graph";
import { OT } from "@planx/graph/types";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { formatDistanceToNow } from "date-fns";
import React, { useRef } from "react";

import { rootFlowPath } from "../../routes/utils";
import Flow from "./components/Flow";
import PreviewBrowser from "./components/PreviewBrowser";
import { useStore } from "./lib/store";
import useScrollControlsAndRememberPosition from "./lib/useScrollControlsAndRememberPosition";
import EditNoteIcon from '@mui/icons-material/EditNote';

interface Operation {
  id: string;
  createdAt: string;
  actor?: {
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
      <Link variant="body2" fontSize="small" fontWeight="600" ml={2} sx={{ display: "flex", alignItems: "center", }}><EditNoteIcon /> View edit history</Link>
    </Box>
  );
};

export const EditHistory = () => {
  const [flowId, flow] = useStore((state) => [state.id, state.flow]);

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

  return (
    <Box>
      {loading && !data ? (
        <DelayedLoadingIndicator />
      ) : (
        data?.operations?.map((op: Operation) => (
          <Box
            key={`container-${op.id}`}
            marginBottom={2}
            padding={2}
            sx={{ background: (theme) => theme.palette.grey[200] }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {`Edited ${formatLastEditDate(op.createdAt)}`}
                </Typography>
                {op.actor && (
                  <Typography variant="body2">
                    {`by ${op.actor?.firstName} ${op.actor?.lastName}`}
                  </Typography>
                )}
              </Box>
              <UndoOutlined titleAccess="Undo this edit" />
            </Box>
            {op.data && (
              <Typography variant="body2" component="ul" padding={2}>
                {[...new Set(formatOps(flow, op.data))].map(
                  (formattedOp, i) => (
                    <li key={i}>{formattedOp}</li>
                  ),
                )}
              </Typography>
            )}
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
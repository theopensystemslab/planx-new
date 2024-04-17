import "./components/Settings";
import "./floweditor.scss";

import { gql, useSubscription } from "@apollo/client";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { format } from "date-fns";
import React, { useRef } from "react";

import { rootFlowPath } from "../../routes/utils";
import EditorMenu from "./components/EditorMenu";
import Flow from "./components/Flow";
import PreviewBrowser from "./components/PreviewBrowser";
import { useStore } from "./lib/store";
import useScrollControlsAndRememberPosition from "./lib/useScrollControlsAndRememberPosition";
import EditNoteIcon from '@mui/icons-material/EditNote';

interface Operation {
  createdAt: string;
  actor?: {
    firstName: string;
    lastName: string;
  };
}

const EditorContainer = styled(Box)(() => ({
  display: "flex",
  alignItems: "stretch",
  overflow: "hidden",
  flexGrow: 1,
}));

export const LastEdited = () => {
  const [flowId] = useStore((state) => [state.id]);

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
    message = `Last edit by ${operation?.actor?.firstName} ${operation?.actor
      ?.lastName} • ${formattedDate(operation?.createdAt)}`;
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
      <Typography variant="body2" fontSize="small" fontWeight="600">
        {message}
      </Typography>
      <Link variant="body2" fontSize="small" fontWeight="600" ml={2} sx={{ display: "flex", alignItems: "center", }}><EditNoteIcon /> View edit history</Link>
    </Box>
  );
};

const FlowEditor: React.FC<any> = ({ flow, breadcrumbs }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useScrollControlsAndRememberPosition(scrollContainerRef);
  const showPreview = useStore((state) => state.showPreview);

  return (
    <EditorContainer id="editor-container">
      <EditorMenu>

      </EditorMenu>
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

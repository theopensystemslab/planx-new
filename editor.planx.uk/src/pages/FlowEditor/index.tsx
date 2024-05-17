import "./components/Settings";
import "./floweditor.scss";

import { gql, useSubscription } from "@apollo/client";
import EditNoteIcon from "@mui/icons-material/EditNote";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { useRef } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { Operation } from "types";

import { rootFlowPath } from "../../routes/utils";
import Flow from "./components/Flow";
import Sidebar from "./components/Sidebar";
import { useStore } from "./lib/store";
import useScrollControlsAndRememberPosition from "./lib/useScrollControlsAndRememberPosition";
import { formatLastEditMessage } from "./utils";

const EditorContainer = styled(Box)(() => ({
  display: "flex",
  alignItems: "stretch",
  overflow: "hidden",
  flexGrow: 1,
}));

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
        fontWeight={FONT_WEIGHT_SEMI_BOLD}
        ml={2}
        sx={{ display: "flex", alignItems: "center" }}
      >
        <EditNoteIcon /> View edit history
      </Link>
    </Box>
  );
};

const FlowEditor: React.FC<any> = ({ flow, breadcrumbs }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useScrollControlsAndRememberPosition(scrollContainerRef);
  const showSidebar = useStore((state) => state.showSidebar);

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
      {showSidebar && (
        <Sidebar
          url={`${window.location.origin}${rootFlowPath(false)}/published`}
        />
      )}
    </EditorContainer>
  );
};

export default FlowEditor;

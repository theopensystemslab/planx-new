import "./components/Settings";
import "./floweditor.scss";

import { gql, useSubscription } from "@apollo/client";
import EditNoteIcon from "@mui/icons-material/EditNote";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses, TooltipProps } from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { format } from "date-fns";
import React, { useRef } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

import { rootFlowPath } from "../../routes/utils";
import EditorMenu from "./components/EditorMenu";
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
}

const EditorContainer = styled(Box)(() => ({
  display: "flex",
  alignItems: "stretch",
  overflow: "hidden",
  flexGrow: 1,
}));

const TooltipWrap = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip
    {...props}
    arrow
    placement="bottom"
    classes={{ popper: className }}
  />
))(() => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: "#2c2c2c",
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#2c2c2c",
    fontSize: "0.8em",
    borderRadius: 0,
    fontWeight: FONT_WEIGHT_SEMI_BOLD,
  },
}));

export const LastEdited = () => {
  const [flowId] = useStore((state) => [state.id]);

  const formattedDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return format(date, "HH:mm:ss, dd LLL yyyy");
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
        padding: theme.spacing(0.5, 2),
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      })}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <Link
          href={`#`}
          variant="body2"
          fontSize="small"
          fontWeight="600"
          mr={2}
          sx={{ display: "flex", alignItems: "center" }}
        >
          <EditNoteIcon /> View edit history
        </Link>
        <Typography variant="body2" fontSize="small" fontWeight="600">
          {message}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "3px",
          }}
        >
          <TooltipWrap title="Georgina Murray">
            <Avatar
              sx={{
                bgcolor: "#1446A0",
                color: "#FFF",
                fontSize: "0.6em",
                fontWeight: "600",
                width: 24,
                height: 24,
              }}
            >
              GM
            </Avatar>
          </TooltipWrap>
          <TooltipWrap title="August Lindemer">
            <Avatar
              sx={{
                bgcolor: "#8C001A",
                color: "#FFF",
                fontSize: "0.6em",
                fontWeight: "600",
                width: 24,
                height: 24,
              }}
            >
              AL
            </Avatar>
          </TooltipWrap>
          <TooltipWrap title="Jessica McInchak">
            <Avatar
              sx={{
                bgcolor: "#5149C1",
                color: "#FFF",
                fontSize: "0.6em",
                fontWeight: "600",
                width: 24,
                height: 24,
              }}
            >
              JM
            </Avatar>
          </TooltipWrap>
          <TooltipWrap title="Ollie Zhang">
            <Avatar
              sx={{
                bgcolor: "#2A7F62",
                color: "#FFF",
                fontSize: "0.6em",
                fontWeight: "600",
                width: 24,
                height: 24,
              }}
            >
              OZ
            </Avatar>
          </TooltipWrap>
          <TooltipWrap title="Dafydd Pearson">
            <Avatar
              sx={{
                bgcolor: "#8B6004",
                color: "#FFF",
                fontSize: "0.6em",
                fontWeight: "600",
                width: 24,
                height: 24,
              }}
            >
              DP
            </Avatar>
          </TooltipWrap>
          <Typography variant="body2" fontSize="small" fontWeight="600">
            +4
          </Typography>
        </Box>

        <Link href={`#`} variant="body2" fontSize="small" fontWeight="600">
          View team members
        </Link>
      </Box>
    </Box>
  );
};

const FlowEditor: React.FC<any> = ({ flow, breadcrumbs }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useScrollControlsAndRememberPosition(scrollContainerRef);
  const showPreview = useStore((state) => state.showPreview);

  return (
    <EditorContainer id="editor-container">
      <EditorMenu></EditorMenu>
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

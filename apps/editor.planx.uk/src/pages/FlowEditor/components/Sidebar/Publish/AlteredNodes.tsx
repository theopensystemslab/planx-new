import AccordionDetails from "@mui/material/AccordionDetails";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { useStore } from "pages/FlowEditor/lib/store";
import { formatLastEditDate } from "pages/FlowEditor/utils";
import React, { useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import BlockQuote from "ui/editor/BlockQuote";
import Caret from "ui/icons/Caret";

import { HistoryItem } from "../EditHistory";
import { isAutoComment } from "../utils";
import {
  AlteredExternalPortalsSummary,
  ExternalPortal,
} from "./AlteredExternalPortals";
import {
  PublishModalAccordion,
  PublishModalAccordionSummary,
} from "./ValidationChecks";

export interface AlteredNode {
  id: string;
  type: TYPES;
  data?: any;
}

const HistoryComment = styled(Box, {
  shouldForwardProp: (prop) => prop != "isTemplatedFlowUpdateComment",
})<{ isTemplatedFlowUpdateComment?: boolean }>(
  ({ theme, isTemplatedFlowUpdateComment }) => ({
    width: "100%",
    margin: theme.spacing(0.5, 0),
    padding: theme.spacing(1, 1.5),
    background: isTemplatedFlowUpdateComment
      ? theme.palette.template.main
      : theme.palette.secondary.dark,
    color: theme.palette.text.primary,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid rgba(0,0,0,0.08)`,
  }),
);

export const AlteredNodeListItem = (props: { node: AlteredNode }) => {
  const { node } = props;
  let text, data;

  if (node.id === "_root") {
    text = "Changed _root flow by adding, deleting or re-ordering nodes";
  } else if (node.id === "0") {
    text = `The entire _root flow will be published for the first time`;
  } else if (node.id && Object.keys(node).length === 1) {
    text = `Deleted node ${node.id}`;
  } else if (node.type && node.data) {
    text = `Added/edited ${TYPES[node.type]}`;
    data = JSON.stringify(node.data, null, 2);
  } else {
    text = `Added/edited ${TYPES[node.type]}`;
  }

  return (
    <ListItem key={node.id} disablePadding sx={{ display: "list-item" }}>
      <Typography variant="body2">{text}</Typography>
      {data && (
        <pre
          style={{
            fontSize: ".8em",
            whiteSpace: "pre-line",
            overflowWrap: "break-word",
            wordWrap: "break-word",
          }}
        >
          {data}
        </pre>
      )}
    </ListItem>
  );
};

interface AlteredNodesSummary {
  title: string;
  portals: ExternalPortal[];
  updated: number;
  deleted: number;
}

export const AlteredNodesSummaryContent = (props: {
  alteredNodes: AlteredNode[];
  lastPublishedTitle: string;
  history?: HistoryItem[];
}) => {
  const { alteredNodes, lastPublishedTitle, history } = props;
  const [expanded, setExpanded] = useState(false);
  const comments = history?.filter((item) => item.type === "comment") || [];
  const operations = history?.filter((item) => item.type === "operation") || [];

  const isPlatformAdmin = useStore.getState().user?.isPlatformAdmin;

  const changeSummary: AlteredNodesSummary = {
    title: lastPublishedTitle,
    portals: [],
    updated: 0,
    deleted: 0,
  };

  alteredNodes.map((node) => {
    if (node.id === "0") {
      changeSummary["title"] =
        "You are publishing this flow for the first time.";
    } else if (node.id && Object.keys(node).length === 1) {
      changeSummary["deleted"] += 1;
    } else if (node.type === TYPES.InternalPortal) {
      if (node.data?.text?.includes("/") && !node.data?.text?.includes(" ")) {
        changeSummary["portals"].push({ ...node.data, flowId: node.id });
      }
    } else if (node.type) {
      changeSummary["updated"] += 1;
    }

    return changeSummary;
  });

  return (
    <Box>
      <Typography variant="h3" component="h2" gutterBottom pt={1}>
        {`Changes to your flow since last publish`}
      </Typography>
      {comments.length > 0 && (
        <List sx={{ listStyleType: "none" }}>
          {comments.map((comment) => (
            <ListItem key={comment.id} disablePadding>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
                  >
                    {comment.firstName} {comment.lastName}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography variant="body2" fontSize="small" py={0.25}>
                      <strong>Commented</strong>{" "}
                      {`${formatLastEditDate(comment.createdAt)}`}
                    </Typography>
                    <HistoryComment
                      isTemplatedFlowUpdateComment={isAutoComment(
                        comment.comment,
                      )}
                    >
                      <BlockQuote>{comment.comment}</BlockQuote>
                    </HistoryComment>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
      {comments.length === 0 && operations.length > 0 && (
        <List sx={{ listStyleType: "none" }}>
          <ListItem key={"operation-summary"} disablePadding>
            <HistoryComment>
              <ListItemText
                primary={
                  <Typography variant="body2">
                    <strong>{`${
                      operations.length === 1
                        ? "1 edit"
                        : `${operations.length} edits`
                    } since last publish`}</strong>
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" fontSize="small">
                    {`Find full details in the History tab in the editor sidebar.`}
                  </Typography>
                }
              />
            </HistoryComment>
          </ListItem>
          <ListItem key={"hint"} disablePadding>
            <Typography variant="body2" fontSize="small">
              {`Hint: Comments added to the History tab in the editor sidebar will display here. Comments are the friendliest way to describe what's changed.`}
            </Typography>
          </ListItem>
        </List>
      )}
      {changeSummary["portals"].length > 0 && (
        <AlteredExternalPortalsSummary portals={changeSummary["portals"]} />
      )}
      {isPlatformAdmin && (
        <PublishModalAccordion
          sx={(theme) => ({
            borderTop: `1px solid ${theme.palette.border.main}`,
          })}
          expanded={expanded}
          onChange={() => setExpanded(!expanded)}
        >
          <PublishModalAccordionSummary expandIcon={<Caret />}>
            <Typography>
              {expanded
                ? "Hide individual node changes"
                : "Show individual node changes"}
            </Typography>
          </PublishModalAccordionSummary>
          <AccordionDetails
            sx={(theme) => ({
              padding: 0,
              backgroundColor: "background.default",
              border: `1px solid ${theme.palette.border.light}`,
            })}
          >
            <List sx={{ listStyleType: "disc", marginLeft: 3 }}>
              <ListItem
                key={"updated"}
                disablePadding
                sx={{ display: "list-item" }}
              >
                <Typography variant="body2" fontWeight="bold">
                  {`${changeSummary.updated} nodes have been updated or added`}
                </Typography>
              </ListItem>
              <ListItem
                key={"deleted"}
                disablePadding
                sx={{ display: "list-item" }}
              >
                <Typography variant="body2" fontWeight="bold">
                  {`${changeSummary.deleted} nodes have been deleted`}
                </Typography>
              </ListItem>
              {alteredNodes.map((node) => (
                <AlteredNodeListItem key={node.id} node={node} />
              ))}
            </List>
          </AccordionDetails>
        </PublishModalAccordion>
      )}
    </Box>
  );
};

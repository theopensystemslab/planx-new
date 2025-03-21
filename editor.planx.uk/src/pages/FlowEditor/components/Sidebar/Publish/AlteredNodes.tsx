import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import SimpleExpand from "@planx/components/shared/Preview/SimpleExpand";
import { useStore } from "pages/FlowEditor/lib/store";
import { formatLastEditDate } from "pages/FlowEditor/utils";
import React from "react";

import { HistoryItem } from "../EditHistory";
import {
  AlteredExternalPortalsSummary,
  ExternalPortal,
} from "./AlteredExternalPortals";

export interface AlteredNode {
  id: string;
  type: TYPES;
  data?: any;
}

export const AlteredNodeListItem = (props: { node: AlteredNode }) => {
  const { node } = props;
  let text, data;

  if (node.id === "_root") {
    text = "Changed _root service by adding, deleting or re-ordering nodes";
  } else if (node.id === "0") {
    text = `The entire _root service will be published for the first time`;
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
      {data && <pre style={{ fontSize: ".8em" }}>{data}</pre>}
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
        "You are publishing the main service for the first time.";
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
      <Typography variant="h4" component="h3" gutterBottom>
        {`Changes to your service since last publish`}
      </Typography>
      {comments.length > 0 && (
        <List sx={{ listStyleType: "disc", marginLeft: 3 }}>
          {comments.map((comment) => (
            <ListItem
              key={comment.id}
              disablePadding
              sx={{ display: "list-item" }}
            >
              <ListItemText
                primary={
                  <Typography variant="body2">{comment.comment}</Typography>
                }
                secondary={
                  <Typography variant="body2" fontSize="small">
                    {`Commented ${formatLastEditDate(comment.createdAt)} by ${
                      comment.firstName
                    } ${comment.lastName}`}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
      {comments.length === 0 && operations.length > 0 && (
        <List sx={{ listStyleType: "disc", marginLeft: 3 }}>
          <ListItem
            key={"operation-summary"}
            disablePadding
            sx={{ display: "list-item" }}
          >
            <ListItemText
              primary={
                <Typography variant="body2">
                  {`${operations.length} edits to your service`}
                </Typography>
              }
              secondary={
                <Typography variant="body2" fontSize="small">
                  {`See full details in "History"`}
                </Typography>
              }
            />
          </ListItem>
          <ListItem key={"hint"} disablePadding>
            <Typography variant="body2" fontSize="small">
              {`Hint: "Add comments" between edits for a friendlier summary here on next publish.`}
            </Typography>
          </ListItem>
        </List>
      )}
      {changeSummary["portals"].length > 0 && (
        <AlteredExternalPortalsSummary portals={changeSummary["portals"]} />
      )}
      {isPlatformAdmin && (
        <SimpleExpand
          id="validation-checks-list"
          data-testid="validation-checks-list"
          lightFontStyle
          buttonText={{
            open: `Show individual node changes`,
            closed: "Hide individual node changes",
          }}
        >
          {(changeSummary["updated"] > 0 || changeSummary["deleted"] > 0) && (
            <Box>
              <List sx={{ listStyleType: "disc", marginLeft: 3 }}>
                <ListItem
                  key={"updated"}
                  disablePadding
                  sx={{ display: "list-item" }}
                >
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                  >{`${changeSummary["updated"]} nodes have been updated or added`}</Typography>
                </ListItem>
                <ListItem
                  key={"deleted"}
                  disablePadding
                  sx={{ display: "list-item" }}
                >
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                  >{`${changeSummary["deleted"]} nodes have been deleted`}</Typography>
                </ListItem>
                {alteredNodes.map((node) => (
                  <AlteredNodeListItem key={node.id} node={node} />
                ))}
              </List>
            </Box>
          )}
        </SimpleExpand>
      )}
    </Box>
  );
};

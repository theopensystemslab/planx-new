import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import React, { useState } from "react";
import Caret from "ui/icons/Caret";

import {
  AlteredExternalPortalsSummary,
  ExternalPortal,
} from "./AlteredExternalPortals";
import { AlteredNode, AlteredNodeListItem } from "./AlteredNodes";

interface AlteredNodesSummary {
  title: string;
  portals: ExternalPortal[];
  updated: number;
  deleted: number;
}

export const AlteredNodesSummaryContent = (props: {
  alteredNodes: AlteredNode[];
  lastPublishedTitle: string;
}) => {
  const { alteredNodes, lastPublishedTitle } = props;
  const [expandNodes, setExpandNodes] = useState<boolean>(false);

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
    <Box pb={2}>
      <Typography variant="h4" component="h3" gutterBottom>
        {`Changes`}
      </Typography>
      {changeSummary["title"] && (
        <Typography variant="body2">{changeSummary["title"]}</Typography>
      )}
      {(changeSummary["updated"] > 0 || changeSummary["deleted"] > 0) && (
        <Box pb={2}>
          <List sx={{ listStyleType: "disc", marginLeft: 3 }}>
            <ListItem
              key={"updated"}
              disablePadding
              sx={{ display: "list-item" }}
            >
              <Typography variant="body2">{`${changeSummary["updated"]} nodes have been updated or added`}</Typography>
            </ListItem>
            <ListItem
              key={"deleted"}
              disablePadding
              sx={{ display: "list-item" }}
            >
              <Typography variant="body2">{`${changeSummary["deleted"]} nodes have been deleted`}</Typography>
            </ListItem>
          </List>
          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              marginBottom: 2,
            }}
          >
            <Box
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Typography variant="body2">{`See detailed changelog `}</Typography>
              <Button
                onClick={() => setExpandNodes((expandNodes) => !expandNodes)}
                size="small"
                disableRipple
              >
                <Caret
                  expanded={expandNodes}
                  color="primary"
                  titleAccess={
                    expandNodes ? "Less information" : "More information"
                  }
                />
              </Button>
            </Box>
            <Collapse in={expandNodes}>
              <Box pb={1}>
                <ul>
                  {alteredNodes.map((node) => (
                    <AlteredNodeListItem node={node} />
                  ))}
                </ul>
              </Box>
            </Collapse>
          </Box>
        </Box>
      )}
      <Divider />
      {changeSummary["portals"].length > 0 && (
        <>
          <AlteredExternalPortalsSummary portals={changeSummary["portals"]} />
          <Divider />
        </>
      )}
    </Box>
  );
};

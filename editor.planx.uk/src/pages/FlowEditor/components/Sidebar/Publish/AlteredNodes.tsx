import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import SimpleExpand from "@planx/components/shared/Preview/SimpleExpand";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

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
}) => {
  const { alteredNodes, lastPublishedTitle } = props;
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
      <Typography variant="h5" component="h3" gutterBottom>
        {`Changes to your service since last publish`}
      </Typography>
      <List sx={{ listStyleType: "disc", marginLeft: 3 }}>
        <ListItem key="comment-1" disablePadding sx={{ display: "list-item" }}>
          <Typography variant="body2">{`Updated CIL flags`}</Typography>
        </ListItem>
        <ListItem key="comment-2" disablePadding sx={{ display: "list-item" }}>
          <Typography variant="body2">{`Turned on send to Power Automate`}</Typography>
        </ListItem>
        <ListItem key="comment-3" disablePadding sx={{ display: "list-item" }}>
          <Typography variant="body2">{`Updated Gov Pay metadata to include new ledger code`}</Typography>
        </ListItem>
      </List>
      {changeSummary["portals"].length > 0 && (
        <AlteredExternalPortalsSummary portals={changeSummary["portals"]} />
      )}
      {isPlatformAdmin && alteredNodes.length > 1 && (
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

import Close from "@mui/icons-material/Close";
import Done from "@mui/icons-material/Done";
import NotInterested from "@mui/icons-material/NotInterested";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import React, { useState } from "react";
import { useAsync } from "react-use";
import Caret from "ui/icons/Caret";

import { formatLastPublishMessage } from "pages/FlowEditor/utils";
import { useStore } from "../../lib/store";

export interface AlteredNode {
  id: string;
  type: TYPES;
  data?: any;
}

const AlteredNodeListItem = (props: { node: AlteredNode }) => {
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
    <li key={node.id}>
      <Typography variant="body2">{text}</Typography>
      {data && <pre style={{ fontSize: ".8em" }}>{data}</pre>}
    </li>
  );
};

interface Portal {
  text: string;
  flowId: string;
  publishedFlowId: number;
  summary: string;
  publishedBy: number;
  publishedAt: string;
}

const AlteredNestedFlowListItem = (props: Portal) => {
  const { text, flowId, publishedFlowId, summary, publishedAt } = props;

  const [nestedFlowLastPublishedTitle, setNestedFlowLastPublishedTitle] =
    useState<string>();
  const lastPublisher = useStore((state) => state.lastPublisher);

  const _nestedFlowLastPublishedRequest = useAsync(async () => {
    const user = await lastPublisher(flowId);
    setNestedFlowLastPublishedTitle(formatLastPublishMessage(publishedAt, user));
  });

  return (
    <ListItem
      key={publishedFlowId}
      disablePadding
      sx={{ display: "list-item" }}
    >
      <ListItemText
        primary={
          useStore.getState().canUserEditTeam(text.split("/")[0]) ? (
            <Link href={`../${text}`} target="_blank">
              <Typography variant="body2">{text}</Typography>
            </Link>
          ) : (
            <Typography variant="body2">{text}</Typography>
          )
        }
        secondary={
          <>
            <Typography variant="body2" fontSize="small">
              {nestedFlowLastPublishedTitle}
            </Typography>
            {summary && (
              <Typography variant="body2" fontSize="small">
                {summary}
              </Typography>
            )}
          </>
        }
      />
    </ListItem>
  );
};

interface AlteredNodesSummary {
  title: string;
  portals: Portal[];
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
      if (node.data?.text?.includes("/")) {
        changeSummary["portals"].push({ ...node.data, flowId: node.id });
      }
    } else if (node.type) {
      changeSummary["updated"] += 1;
    }

    return changeSummary;
  });

  return (
    <Box pb={2}>
      <Typography variant="h4" component="h3" pb={2}>
        {`Changes`}
      </Typography>
      {changeSummary["title"] && (
        <Typography variant="body2">
          {changeSummary["title"]}
        </Typography>
      )}
      {(changeSummary["updated"] > 0 || changeSummary["deleted"] > 0) && (
        <Box pb={2}>
          <List sx={{ listStyleType: "disc", marginLeft: 3 }}>
            <ListItem key={"updated"} disablePadding sx={{ display: "list-item" }}>
              <Typography variant="body2">{`${changeSummary["updated"]} nodes have been updated or added`}</Typography>
            </ListItem>
            <ListItem key={"deleted"} disablePadding sx={{ display: "list-item" }}>
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
          <Box pt={2}>
            <Typography variant="body2">{`This includes recently published changes in the following nested services:`}</Typography>
            <List sx={{ listStyleType: "disc", marginLeft: 3 }}>
              {changeSummary["portals"].map((portal) => (
                <AlteredNestedFlowListItem {...portal} />
              ))}
            </List>
          </Box>
          <Divider />
        </>
      )}
    </Box>
  );
};

export interface ValidationCheck {
  title: string;
  status: "Pass" | "Fail" | "Not applicable";
  message: string;
}

export const ValidationChecks = (props: {
  validationChecks: ValidationCheck[]
}) => {
  const { validationChecks } = props;

  const Icon: Record<ValidationCheck["status"], React.ReactElement> = {
    "Pass": <Done color="success" />,
    "Fail": <Close color="error" />,
    "Not applicable": <NotInterested color="disabled" />
  };

  return (
    <Box pb={2}>
      <Typography variant="h4" component="h3">
        Validation checks
      </Typography>
      <List sx={{ pb: 2 }}>
        {validationChecks.map((check, i) => (
          <ListItem key={i} disablePadding>
            <ListItemIcon sx={{ minWidth: (theme) => theme.spacing(3) }}>
              {Icon[check.status]}
            </ListItemIcon>
            <ListItemText
              primary={<Typography variant="body2" color={check.status === "Not applicable" ? "GrayText" : "inherit"}>{check.title}</Typography>}
              secondary={<Typography variant="body2" fontSize="small" color={check.status === "Not applicable" ? "GrayText" : "inherit"}>{check.message}</Typography>}
            />
          </ListItem>
        ))}
      </List>
      <Divider />
    </Box>
  );
}

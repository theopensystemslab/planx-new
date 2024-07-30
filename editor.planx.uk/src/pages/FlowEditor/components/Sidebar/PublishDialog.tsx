import Cancel from "@mui/icons-material/Cancel";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Close from "@mui/icons-material/Close";
import Done from "@mui/icons-material/Done";
import Help from "@mui/icons-material/Help";
import NotInterested from "@mui/icons-material/NotInterested";
import Warning from "@mui/icons-material/Warning";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses, TooltipProps } from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import countBy from "lodash/countBy";
import { formatLastPublishMessage } from "pages/FlowEditor/utils";
import React, { useState } from "react";
import { useAsync } from "react-use";
import Caret from "ui/icons/Caret";

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
    setNestedFlowLastPublishedTitle(
      formatLastPublishMessage(publishedAt, user),
    );
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

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[1],
    fontSize: theme.typography.body2,
  },
}));

export interface ValidationCheck {
  title: string;
  status: "Pass" | "Fail" | "Warn" | "Not applicable";
  message: string;
}

export const ValidationChecks = (props: {
  validationChecks: ValidationCheck[];
}) => {
  const { validationChecks } = props;

  const Icon: Record<ValidationCheck["status"], React.ReactElement> = {
    Pass: <Done color="success" />,
    Fail: <Close color="error" />,
    Warn: <Warning color="warning" />,
    "Not applicable": <NotInterested color="disabled" />,
  };

  return (
    <Box pb={2}>
      <Typography
        variant="h4"
        component="h3"
        gutterBottom
        sx={{ display: "flex", alignItems: "center" }}
      >
        Validation checks
        <LightTooltip
          title="Validation checks are automatic tests that scan your service and highlight when content changes introduce an error, like incorrectly using a component type or breaking an integration."
          placement="right"
        >
          <IconButton>
            <Help color="primary" />
          </IconButton>
        </LightTooltip>
      </Typography>
      <ValidationSummary validationChecks={validationChecks} />
      <List>
        {validationChecks.map((check, i) => (
          <ListItem
            key={i}
            dense
            sx={{
              backgroundColor: (theme) => theme.palette.background.default,
              border: (theme) => `1px solid ${theme.palette.border.light}`,
            }}
          >
            <ListItemIcon sx={{ minWidth: (theme) => theme.spacing(4) }}>
              {Icon[check.status]}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  variant="body2"
                  color={
                    check.status === "Not applicable" ? "GrayText" : "inherit"
                  }
                >
                  {check.title}
                </Typography>
              }
              secondary={
                <Typography
                  variant="body2"
                  fontSize="small"
                  color={
                    check.status === "Not applicable" ? "GrayText" : "inherit"
                  }
                >
                  {check.message}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

const ValidationSummary = (props: { validationChecks: ValidationCheck[] }) => {
  const { validationChecks } = props;
  const atLeastOneFail =
    validationChecks.filter((check) => check.status === "Fail").length > 0;
  const countByStatus = countBy(validationChecks, "status");

  const summary: string[] = [];
  Object.entries(countByStatus).map(([status, count]) => {
    switch (status) {
      case "Fail":
        summary.push(`${count} failing`);
        break;
      case "Warn":
        summary.push(count === 1 ? `${count} warning` : `${count} warnings`);
        break;
      case "Pass":
        summary.push(`${count} successful`);
        break;
      case "Not applicable":
        summary.push(`${count} skipped`);
        break;
    }
  });
  // If there aren't any fails, still add "0 errors" to end of summary string for distinction from "warnings"
  const formattedSummary = atLeastOneFail
    ? summary.join(", ")
    : summary.join(", ").concat(", 0 errors");

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      {atLeastOneFail ? (
        <Cancel
          color="error"
          fontSize="large"
          sx={{ minWidth: (theme) => theme.spacing(5.5) }}
        />
      ) : (
        <CheckCircle
          color="success"
          fontSize="large"
          sx={{ minWidth: (theme) => theme.spacing(5.5) }}
        />
      )}
      <Typography
        variant="body1"
        component="div"
        sx={{ display: "flex", flexDirection: "column" }}
        gutterBottom
      >
        {atLeastOneFail ? `Fix errors before publishing` : `Ready to publish`}
        <Typography variant="caption">{formattedSummary}</Typography>
      </Typography>
    </Box>
  );
};

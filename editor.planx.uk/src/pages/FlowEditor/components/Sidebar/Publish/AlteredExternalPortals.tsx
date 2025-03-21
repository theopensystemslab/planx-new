import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { formatLastPublishMessage } from "pages/FlowEditor/utils";
import React, { useState } from "react";
import { useAsync } from "react-use";

import { useStore } from "../../../lib/store";

export interface ExternalPortal {
  text: string;
  flowId: string;
  publishedFlowId: number;
  summary: string;
  publishedBy: number;
  publishedAt: string;
}

const AlteredExternalPortalListItem = (props: ExternalPortal) => {
  const { text, flowId, publishedFlowId, summary, publishedAt } = props;

  const [externalPortalLastPublishedTitle, setNestedFlowLastPublishedTitle] =
    useState<string>();
  const lastPublisher = useStore((state) => state.lastPublisher);

  const _externalPortalLastPublishedRequest = useAsync(async () => {
    const user = await lastPublisher(flowId);
    setNestedFlowLastPublishedTitle(
      formatLastPublishMessage(publishedAt, user),
    );
  });

  return (
    <ListItem
      key={publishedFlowId}
      disablePadding
      sx={{
        backgroundColor: "border.input",
        color: "common.white",
        px: 1.5,
        py: 1,
        margin: 0,
      }}
    >
      <ListItemText
        sx={{ color: "common.white" }}
        primary={
          useStore.getState().canUserEditTeam(text.split("/")[0]) ? (
            <Link href={`../${text}`} target="_blank" color="inherit">
              <Typography variant="body1">{text}</Typography>
            </Link>
          ) : (
            <Typography variant="body1">{text}</Typography>
          )
        }
        secondary={
          <>
            <Typography
              color="secondary.dark"
              variant="body2"
              fontSize="small"
              sx={{ pt: 0.5 }}
            >
              {externalPortalLastPublishedTitle}
            </Typography>
            {summary && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  pt: 0.5,
                  color: "common.white",
                  "&::before": {
                    content: '"“"',
                    fontSize: "1.25em",
                  },
                  "&::after": {
                    content: '"”"',
                    fontSize: "1.25em",
                  },
                }}
              >
                <Typography variant="body2">{summary}</Typography>
              </Box>
            )}
          </>
        }
      />
    </ListItem>
  );
};

export const AlteredExternalPortalsSummary = (props: {
  portals: ExternalPortal[];
}) => {
  const { portals } = props;

  return (
    <Box py={2}>
      <Typography variant="h4" component="h3" gutterBottom>
        {`Nested services`}
      </Typography>
      <List>
        {portals.map((portal) => (
          <AlteredExternalPortalListItem key={portal.flowId} {...portal} />
        ))}
      </List>
    </Box>
  );
};

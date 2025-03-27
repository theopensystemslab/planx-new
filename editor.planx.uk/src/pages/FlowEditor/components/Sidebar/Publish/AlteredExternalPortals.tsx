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
              {externalPortalLastPublishedTitle}
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

export const AlteredExternalPortalsSummary = (props: {
  portals: ExternalPortal[];
}) => {
  const { portals } = props;

  return (
    <Box pt={2}>
      <Typography variant="h4" component="h3" gutterBottom>
        {`Changes to nested services`}
      </Typography>
      <List sx={{ listStyleType: "disc", marginLeft: 3 }}>
        {portals.map((portal) => (
          <AlteredExternalPortalListItem key={portal.flowId} {...portal} />
        ))}
      </List>
    </Box>
  );
};

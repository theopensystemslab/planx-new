import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { formatLastPublishMessage } from "pages/FlowEditor/utils";
import React, { useState } from "react";
import { useAsync } from "react-use";
import { focusStyle } from "theme";
import BlockQuote from "ui/editor/BlockQuote";

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
      formatLastPublishMessage(publishedAt, user).formatted,
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
        py: 0.7,
        margin: 0,
        mb: 1,
        "&:focus-within": {
          ...focusStyle,
          "& *": {
            color: "text.primary",
          },
        },
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
                  alignItems: "flex-start",
                  pt: 0.5,
                  color: "common.white",
                }}
              >
                <BlockQuote>{summary}</BlockQuote>
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
    <Box py={1}>
      <Typography variant="h4" component="h3" gutterBottom>
        {`Nested flows`}
      </Typography>
      <List>
        {portals.map((portal) => (
          <AlteredExternalPortalListItem key={portal.flowId} {...portal} />
        ))}
      </List>
    </Box>
  );
};

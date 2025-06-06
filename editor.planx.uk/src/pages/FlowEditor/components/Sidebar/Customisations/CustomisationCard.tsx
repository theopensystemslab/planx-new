import Done from "@mui/icons-material/Done";
import ListItem, { ListItemProps } from "@mui/material/ListItem";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import { NodeEdits } from "./types";

interface Props {
  nodeId: string;
  nodeEdits?: NodeEdits
};

const Root = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== "isComplete",
})<ListItemProps & { isComplete: boolean }>(({ theme, isComplete }) => ({
  display: "list-item",
  backgroundColor:
    isComplete
      ? theme.palette.background.paper
      : theme.palette.nodeTag.blocking, // same color as "customisation" tag for now
  border: `1px solid`,
  borderColor: theme.palette.border.main,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

export const CustomisationCard: React.FC<Props> = ({ nodeId, nodeEdits }) => {
  const [flow] = useStore((state) => [state.flow]);
  const cardTitle = 
    flow[nodeId].data?.title ||
    flow[nodeId].data?.text ||
    flow[nodeId].type

  return (
    <Root isComplete={Boolean(nodeEdits)}>
      <Typography variant="h5" alignContent="center" alignItems="center">
        {nodeEdits && <Done color="success" />}
        {cardTitle}
      </Typography>
      {nodeEdits && (
        <Typography variant="body2">
          {/** TODO decide whether to include details of _what_ was edited? Just logging data for now! */}
          {JSON.stringify(nodeEdits, null, 2)}
        </Typography>
      )}
    </Root>
  )
}
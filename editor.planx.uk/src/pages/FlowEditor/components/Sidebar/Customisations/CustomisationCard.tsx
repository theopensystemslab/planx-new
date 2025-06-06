import Done from "@mui/icons-material/Done";
import ListItemButton, { ListItemButtonProps } from "@mui/material/ListItemButton";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";
import { useNavigation } from "react-navi";

import { NodeEdits } from "./types";

interface Props {
  nodeId: string;
  nodeEdits?: NodeEdits
};

const Root = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== "isComplete",
})<ListItemButtonProps & { isComplete: boolean }>(({ theme, isComplete }) => ({
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

  // Get ordered flow of indexed nodes from store
  const [flow, orderedFlow, setOrderedFlow, getURLForNode] = useStore((state) => [
    state.flow,
    state.orderedFlow,
    state.setOrderedFlow,
    state.getURLForNode,
  ]);

  // Ensure we have an indexed version of the flow ready to generate links
  // TODO: Should we move this responsibility to the store?
  useEffect(() => {
    if (!orderedFlow) setOrderedFlow();
  }, [orderedFlow, setOrderedFlow]);
  
  const cardTitle = 
    flow[nodeId].data?.title ||
    flow[nodeId].data?.text ||
    flow[nodeId].type

  const { navigate } = useNavigation();

  const handleClick = () => {
    const url = getURLForNode(nodeId);
    navigate(url);
  };

  return (
    <Root isComplete={Boolean(nodeEdits)} onClick={handleClick}>
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
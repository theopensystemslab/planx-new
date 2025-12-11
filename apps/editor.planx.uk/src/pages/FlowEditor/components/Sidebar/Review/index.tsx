import Box from "@mui/material/Box";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useMemo } from "react";

import { ReviewCard } from "./ReviewCard";

const Reviews = () => {
  const [flow, filterFlowByTag] = useStore((state) => [
    state.flow,
    state.filterFlowByTag,
  ]);

  // Only re-run filter when flow changes
  const sortedReviewNodeIds = useMemo(
    () => Object.keys(filterFlowByTag("toReview")),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [flow],
  );

  const [orderedFlow, setOrderedFlow] = useStore((state) => [
    state.orderedFlow,
    state.setOrderedFlow,
  ]);

  // ReviewCard relies on the data from indexed nodes
  useEffect(() => {
    if (!orderedFlow) setOrderedFlow();
  }, [orderedFlow, setOrderedFlow]);

  return (
    <Box p={2} sx={{ backgroundColor: "background.paper", minHeight: "100%" }}>
      <Typography variant="h4" mb={1}>
        {`Nodes with a 'To review' tag`}
      </Typography>
      {sortedReviewNodeIds.length ? (
        <List sx={{ mt: 1 }}>
          {sortedReviewNodeIds.map((nodeId) => (
            <ReviewCard key={nodeId} nodeId={nodeId} />
          ))}
        </List>
      ) : (
        <Typography variant="body1" color="text.secondary" mt={2}>
          No nodes are currently tagged 'To review'.
        </Typography>
      )}
    </Box>
  );
};

export default Reviews;

import Box from "@mui/material/Box";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import { sortIdsDepthFirst } from "@planx/graph";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import { ReviewCard } from "./ReviewCard";

const Reviews = () => {
  const flow = useStore((state) => state.flow);

  // Get the nodes within this flow that are tagged as 'To review' and  sort them top-down to match graph
  const reviewNodeIds = new Set(
    Object.entries(flow)
      .filter(([_nodeId, nodeData]) =>
        Boolean(nodeData.data?.tags?.includes("toReview")),
      )
      .map(([nodeId]) => nodeId),
  );
  const sortedReviewNodeIds = sortIdsDepthFirst(flow)(reviewNodeIds);

  return (
    <Box p={2} sx={{ backgroundColor: "background.paper", minHeight: "100%" }}>
      <Typography variant="h4" mb={1}>
        {`Nodes with a 'To review' tag`}
      </Typography>
      <List sx={{ mt: 1 }}>
        {sortedReviewNodeIds.map((nodeId) => {
          const node = flow[nodeId];
          const notes = node?.data?.notes;
          return <ReviewCard key={nodeId} nodeId={nodeId} notes={notes} />;
        })}
      </List>
    </Box>
  );
};

export default Reviews;

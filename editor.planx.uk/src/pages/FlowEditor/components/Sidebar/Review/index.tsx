import Box from "@mui/material/Box";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useMemo } from "react";

import { ReviewCard } from "./ReviewCard";

const Reviews = () => {
  const flow = useStore((state) => state.flow);
  const filterFlowByTag = useStore((state) => state.filterFlowByTag);

  const sortedReviewNodeIds = useMemo(
    () => Object.keys(filterFlowByTag("toReview")),
    [flow, filterFlowByTag],
  );

  return (
    <Box p={2} sx={{ backgroundColor: "background.paper", minHeight: "100%" }}>
      <Typography variant="h4" mb={1}>
        {`Nodes with a 'To review' tag`}
      </Typography>
      <List sx={{ mt: 1 }}>
        {sortedReviewNodeIds.map((nodeId) => (
          <ReviewCard key={nodeId} nodeId={nodeId} />
        ))}
      </List>
    </Box>
  );
};

export default Reviews;

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import React from "react";

import { useUnreadFeedback } from "./useUnreadFeedback";

interface FeedbackWidgetProps {
  teamSlug: string;
}

export default function FeedbackWidget({ teamSlug }: FeedbackWidgetProps) {
  const { flows, total } = useUnreadFeedback(teamSlug);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          gap: 1,
          px: 1.5,
          pb: 1,
        }}
      >
        <Typography variant="h1" component="p">
          {total}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          unread items across all flows
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ overflowY: "auto" }}>
        {flows.map(({ flowName, count }) => (
          <React.Fragment key={flowName}>
            <Box sx={{ px: 1.5, py: 1 }}>
              <Typography variant="body2">
                <strong>{flowName}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {count} unread {count === 1 ? "item" : "items"}
              </Typography>
            </Box>
            <Divider />
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
}

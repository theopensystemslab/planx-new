import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { Link } from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import React from "react";

import { useStore } from "../../FlowEditor/lib/store";
import { FlowSummary, useUnreadFeedback } from "./useUnreadFeedback";

interface FeedbackWidgetProps {
  flows: FlowSummary[];
  total: number;
  teamSlug: string;
  loading?: boolean;
}

export function FeedbackWidget({
  flows,
  total,
  teamSlug,
  loading = false,
}: FeedbackWidgetProps) {
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <DelayedLoadingIndicator inline msDelayBeforeVisible={300} />
      </Box>
    );
  }

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
        {flows.map(({ flowName, flowSlug, count }) => (
          <React.Fragment key={flowName}>
            <Box
              sx={{
                position: "relative",
                px: 1.5,
                py: 1,
                "&:hover": { backgroundColor: "background.paper" },
              }}
            >
              <Link
                to="/app/$team/$flow/feedback"
                params={{ team: teamSlug, flow: flowSlug }}
                style={{ position: "absolute", inset: 0, zIndex: 1 }}
                aria-label={`View feedback for ${flowName}`}
              />
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

export default function ConnectedFeedbackWidget() {
  const teamSlug = useStore((state) => state.getTeam().slug);
  const { flows, total, loading } = useUnreadFeedback(teamSlug);

  return (
    <FeedbackWidget
      flows={flows}
      total={total}
      teamSlug={teamSlug}
      loading={loading}
    />
  );
}

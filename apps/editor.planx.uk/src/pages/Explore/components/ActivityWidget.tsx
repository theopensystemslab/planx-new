import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import Typography from "@mui/material/Typography";
import { createLink } from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import React from "react";
import { FONT_WEIGHT_BOLD } from "theme";
import { EmptyState } from "ui/editor/EmptyState";
import { Dot } from "ui/shared/Dot";
import { RelativeTime } from "ui/shared/RelativeTime";

import type { ActivityEvent } from "./useActivityFeed";
import { ActivityEventType, useActivityFeed } from "./useActivityFeed";

const ActivityListItemLink = createLink(ListItemButton);

type ActivityLinkProps =
  | { to: "/app/$team/$flow"; params: { team: string; flow: string } }
  | { to: "/app/$team"; params: { team: string } };

function getActivityLink(event: ActivityEvent): ActivityLinkProps {
  if (event.type === ActivityEventType.ServiceOnline && event.flowSlug) {
    return {
      to: "/app/$team/$flow",
      params: { team: event.teamSlug, flow: event.flowSlug },
    };
  }
  return { to: "/app/$team", params: { team: event.teamSlug } };
}

interface ActivityWidgetProps {
  events?: ActivityEvent[];
  loading?: boolean;
}

interface ActivityMessage {
  primary: React.ReactNode;
  secondary?: string;
}

const TrialIndicator = ({ event }: { event: ActivityEvent }) =>
  event.isTrial ? (
    <Typography
      component="span"
      variant="body1"
      sx={{ color: "text.secondary", fontWeight: "normal" }}
    >
      {" "}
      (trial)
    </Typography>
  ) : null;

function getActivityMessage(event: ActivityEvent): ActivityMessage {
  switch (event.type) {
    case ActivityEventType.TeamJoined:
      return {
        primary: (
          <>
            {event.teamName} joined Plan✕
            <TrialIndicator event={event} />
          </>
        ),
      };
    case ActivityEventType.ServiceOnline:
      return {
        primary: (
          <>
            {event.teamName} set a service online
            <TrialIndicator event={event} />
          </>
        ),
        secondary: event.flowName ?? undefined,
      };
  }
}

const EVENT_DOT_COLOR: Record<ActivityEventType, string> = {
  [ActivityEventType.TeamJoined]: "primary.main",
  [ActivityEventType.ServiceOnline]: "success.main",
};

export function ActivityWidget({
  events,
  loading = false,
}: ActivityWidgetProps) {
  if (loading) {
    return (
      <List
        disablePadding
        sx={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <DelayedLoadingIndicator inline msDelayBeforeVisible={300} />
      </List>
    );
  }

  if (!events?.length) {
    return (
      <Box sx={{ p: 2 }}>
        <EmptyState
          size="small"
          title="No recent activity"
          description="Activity will appear here as councils join Plan✕ and set services online"
        />
      </Box>
    );
  }

  return (
    <List
      disablePadding
      sx={{
        overflowY: "auto",
        flex: 1,
        borderTop: "1px solid",
        borderColor: "border.main",
      }}
    >
      {events.map((event, index) => {
        const { primary, secondary } = getActivityMessage(event);
        return (
          <React.Fragment key={event.id}>
            {index > 0 && <Divider sx={{ borderColor: "border.main" }} />}
            <ActivityListItemLink
              {...getActivityLink(event)}
              alignItems="flex-start"
              sx={{ px: 2, py: 1.5, gap: 1.5 }}
            >
              <Box sx={{ display: "flex", alignItems: "center", height: 24 }}>
                <Dot sx={{ bgcolor: EVENT_DOT_COLOR[event.type] }} />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.25,
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{ fontWeight: FONT_WEIGHT_BOLD }}
                >
                  {primary}
                </Typography>
                {secondary && (
                  <Typography variant="body3" sx={{ color: "text.secondary" }}>
                    {secondary}
                  </Typography>
                )}
              </Box>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", flexShrink: 0, ml: "auto" }}
              >
                <RelativeTime date={event.eventTime} placement="left" />
              </Typography>
            </ActivityListItemLink>
          </React.Fragment>
        );
      })}
    </List>
  );
}

export default function ConnectedActivityWidget() {
  const { data, loading } = useActivityFeed();

  return <ActivityWidget events={data?.events} loading={loading} />;
}

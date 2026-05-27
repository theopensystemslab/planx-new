import Stack from "@mui/material/Stack";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { useRecentNotifications } from "hooks/data/useRecentNotifications";
import NotificationCardItem from "pages/FlowEditor/components/Notifications/NotificationCard";
import { Notification } from "pages/FlowEditor/components/Notifications/types";
import { partitionBySuperseded } from "pages/FlowEditor/components/Notifications/utils";
import { useStore } from "pages/FlowEditor/lib/store";
import { DashboardWidget } from "ui/editor/DashboardWidget";
import { EmptyState } from "ui/editor/EmptyState";

const WIDGET_LIMIT = 3;

interface NotificationsWidgetProps {
  notifications: Notification[];
  totalCount: number;
  teamSlug: string;
  loading?: boolean;
}

export function NotificationsWidget({
  notifications,
  totalCount,
  teamSlug,
  loading = false,
}: NotificationsWidgetProps) {
  if (loading) {
    return (
      <DashboardWidget
        title="Notifications"
        count={totalCount}
        linkTarget={`/app/${teamSlug}/notifications`}
        linkText="view all notifications"
      >
        <DelayedLoadingIndicator inline msDelayBeforeVisible={300} />
      </DashboardWidget>
    );
  }

  if (notifications.length === 0) {
    return (
      <DashboardWidget
        title="Notifications"
        count={totalCount}
        linkTarget={`/app/${teamSlug}/notifications`}
        linkText="view all notifications"
      >
        <EmptyState
          size="small"
          title="No notifications, you're all up to date"
          sx={{ mx: 2 }}
        />
      </DashboardWidget>
    );
  }

  return (
    <DashboardWidget
      title="Notifications"
      count={totalCount}
      linkTarget={`/app/${teamSlug}/notifications`}
      linkText="view all notifications"
    >
      <Stack component="ul" sx={{ overflowY: "auto", flex: 1, m: 0, p: 0 }}>
        {notifications.map((notification) => (
          <NotificationCardItem
            key={notification.id}
            notification={notification}
            compact
          />
        ))}
      </Stack>
    </DashboardWidget>
  );
}

export default function ConnectedNotificationsWidget() {
  const team = useStore((state) => state.getTeam());
  const { active, loading } = useRecentNotifications();
  const { current: activeNotifications } = partitionBySuperseded(active);
  const visibleNotifications = activeNotifications.slice(0, WIDGET_LIMIT);

  return (
    <NotificationsWidget
      notifications={visibleNotifications}
      totalCount={activeNotifications.length}
      teamSlug={team.slug}
      loading={loading}
    />
  );
}

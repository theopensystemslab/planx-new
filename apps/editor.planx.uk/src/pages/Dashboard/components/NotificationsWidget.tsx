import Stack from "@mui/material/Stack";
import { useRecentNotifications } from "hooks/data/useRecentNotifications";
import NotificationCardItem from "pages/FlowEditor/components/Notifications/NotificationCard";
import { partitionBySuperseded } from "pages/FlowEditor/components/Notifications/utils";
import { useStore } from "pages/FlowEditor/lib/store";
import { DashboardWidget } from "ui/editor/DashboardWidget";
import { EmptyState } from "ui/editor/EmptyState";

const WIDGET_LIMIT = 3;

export const NotificationsWidget = () => {
  const team = useStore((state) => state.getTeam());
  const { active } = useRecentNotifications();
  const { current: activeNotifications } = partitionBySuperseded(active);
  const visibleNotifications = activeNotifications.slice(0, WIDGET_LIMIT);

  return (
    <DashboardWidget
      title="Notifications"
      count={activeNotifications.length}
      linkTarget={`/app/${team.slug}/notifications`}
      linkText="view all notifications"
    >
      {visibleNotifications.length === 0 ? (
        <EmptyState
          size="small"
          title="No notifications, you're all up to date"
          sx={{ mx: 2 }}
        />
      ) : (
        <Stack component="ul" sx={{ overflowY: "auto", flex: 1, m: 0, p: 0 }}>
          {visibleNotifications.map((notification) => (
            <NotificationCardItem
              key={notification.id}
              notification={notification}
              compact
            />
          ))}
        </Stack>
      )}
    </DashboardWidget>
  );
};

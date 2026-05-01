import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Popover from "@mui/material/Popover";
import Tabs, { tabsClasses } from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { useNavigate } from "@tanstack/react-router";
import NotificationCard from "pages/FlowEditor/components/Notifications/NotificationCard";
import { Notification } from "pages/FlowEditor/components/Notifications/types";
import {
  getStatusLabel,
  partitionBySuperseded,
} from "pages/FlowEditor/components/Notifications/utils";
import { useState } from "react";
import StyledTab from "ui/editor/StyledTab";

interface Props {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  activeNotifications: Notification[];
  resolvedNotifications: Notification[];
  teamSlug: string;
}

const NotificationsPanel = ({
  anchorEl,
  onClose,
  activeNotifications,
  resolvedNotifications,
  teamSlug,
}: Props) => {
  const navigate = useNavigate();
  const open = Boolean(anchorEl);
  const [tab, setTab] = useState(0);

  const handleViewAll = () => {
    onClose();
    navigate({ to: `/app/${teamSlug}/notifications` });
  };

  const handleGoToFlow = (notification: Notification) => {
    onClose();
    navigate({ to: `/${notification.team.slug}/${notification.flow.slug}` });
  };

  const { current: currentNotifications, superseded } =
    partitionBySuperseded(activeNotifications);
  const supersededIds = new Set(superseded.map((n) => n.id));
  const allInactive = [...superseded, ...resolvedNotifications];
  const visibleNotifications = tab === 0 ? currentNotifications : allInactive;

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "center", horizontal: "right" }}
      transformOrigin={{ vertical: "center", horizontal: "left" }}
      slotProps={{
        paper: {
          sx: {
            width: 320,
            height: 480,
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >
      <Box
        sx={{
          px: 0.5,
          [`& .${tabsClasses.indicator}`]: { display: "none" },
        }}
      >
        <Tabs value={tab} onChange={(_, value) => setTab(value)}>
          <StyledTab
            label={`Active${currentNotifications.length ? ` (${currentNotifications.length})` : ""}`}
          />
          <StyledTab label="Inactive" />
        </Tabs>
      </Box>
      <Divider />
      <Box sx={{ overflowY: "auto", flex: 1, p: 1.5 }}>
        {!visibleNotifications.length && (
          <Typography variant="body2" color="textSecondary">
            {tab === 0
              ? "No active notifications."
              : "No inactive notifications."}
          </Typography>
        )}
        {visibleNotifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onGoToFlow={() => handleGoToFlow(notification)}
            statusLabel={
              tab === 1
                ? getStatusLabel(notification.id, supersededIds)
                : undefined
            }
            sx={{ marginBottom: 1.5 }}
          />
        ))}
      </Box>
      <Divider />
      <Box sx={{ p: 1 }}>
        <Button onClick={handleViewAll} size="small" fullWidth>
          View all notifications
        </Button>
      </Box>
    </Popover>
  );
};

export default NotificationsPanel;

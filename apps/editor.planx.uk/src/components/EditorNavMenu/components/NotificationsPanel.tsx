import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Fade from "@mui/material/Fade";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
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

const TabList = styled(Box)(({ theme }) => ({
  position: "relative",
  "&::after": {
    content: "''",
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "1px",
    backgroundColor: theme.palette.border.main,
  },
  [`& .${tabsClasses.root}`]: {
    minHeight: "0",
    padding: theme.spacing(0, 0.5),
  },
  [`& .${tabsClasses.indicator}`]: {
    display: "none",
  },
}));

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
      slots={{ transition: Fade }}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "bottom", horizontal: "left" }}
      slotProps={{
        paper: {
          sx: {
            width: 480,
            height: 640,
            display: "flex",
            flexDirection: "column",
            borderRadius: (theme) => theme.shape.borderRadius,
          },
        },
        backdrop: {
          sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1,
          py: 0.5,
          position: "sticky",
          top: 0,
          backgroundColor: "background.paper",
          zIndex: 1,
        }}
      >
        <Typography variant="h4">Notifications</Typography>
        <IconButton aria-label="close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <TabList>
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          variant="fullWidth"
        >
          <StyledTab
            label={`Active${currentNotifications.length ? ` (${currentNotifications.length})` : ""}`}
          />
          <StyledTab label="Inactive" />
        </Tabs>
      </TabList>
      <Divider />
      <Box sx={{ overflowY: "auto", flex: 1, p: 1.5 }}>
        {!visibleNotifications.length && (
          <Typography variant="body2" color="textSecondary">
            {tab === 0
              ? "No active notifications."
              : "No inactive notifications."}
          </Typography>
        )}
        <Stack spacing={1}>
          {visibleNotifications.map((notification) => (
            <Box key={notification.id} onClick={onClose}>
              <NotificationCard
                notification={notification}
                statusLabel={
                  tab === 1
                    ? getStatusLabel(notification.id, supersededIds)
                    : undefined
                }
              />
            </Box>
          ))}
        </Stack>
      </Box>
      <Divider />
      <Box sx={{ p: 1 }}>
        <Button
          onClick={handleViewAll}
          size="small"
          variant="contained"
          color="secondary"
          sx={{ backgroundColor: "background.default" }}
          fullWidth
        >
          View all notifications
        </Button>
      </Box>
    </Popover>
  );
};

export default NotificationsPanel;

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Tabs, { tabsClasses } from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { WarningContainer } from "@planx/components/shared/Preview/WarningContainer";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import SettingsSection from "ui/editor/SettingsSection";
import StyledTab from "ui/editor/StyledTab";

import NotificationCard from "./NotificationCard";
import { NotificationProps } from "./types";
import { getStatusLabel, partitionBySuperseded } from "./utils";

const TabList = styled(Box)(() => ({
  position: "relative",
  marginLeft: "-12px",
  [`& .${tabsClasses.indicator}`]: {
    display: "none",
  },
}));

export const Notifications = ({ notifications }: NotificationProps) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  const unresolved = notifications.filter((n) => !n.resolvedAt);
  const { current: activeNotifications, superseded } =
    partitionBySuperseded(unresolved);
  const supersededIds = new Set(superseded.map((n) => n.id));
  const inactiveNotifications = [
    ...superseded,
    ...notifications.filter((n) => !!n.resolvedAt),
  ];
  const visibleNotifications =
    tab === 0 ? activeNotifications : inactiveNotifications;

  return (
    <Container maxWidth="formWrap">
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          Notifications
        </Typography>
        <Typography variant="body1">Alerts about your Plan✕ flows.</Typography>
      </SettingsSection>
      <TabList sx={{ marginBottom: 3 }}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)}>
          <StyledTab
            label={`Active${activeNotifications.length ? ` (${activeNotifications.length})` : ""}`}
          />
          <StyledTab label="Inactive" />
        </Tabs>
      </TabList>
      {!visibleNotifications.length && (
        <WarningContainer>
          <Typography variant="body2">
            {tab === 0
              ? "No active notifications found."
              : "No inactive notifications found."}
          </Typography>
        </WarningContainer>
      )}
      {visibleNotifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onGoToFlow={() =>
            navigate({
              to: `/${notification.team.slug}/${notification.flow.slug}`,
            })
          }
          statusLabel={
            tab === 1
              ? getStatusLabel(notification.id, supersededIds)
              : undefined
          }
          sx={{ maxWidth: "formWrap", marginBottom: 3 }}
        />
      ))}
    </Container>
  );
};

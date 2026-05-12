import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Tabs, { tabsClasses } from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { WarningContainer } from "@planx/components/shared/Preview/WarningContainer";
import { useState } from "react";
import StyledTab from "ui/editor/StyledTab";

import NotificationCard from "./NotificationCard";
import { NotificationProps } from "./types";
import { partitionBySuperseded } from "./utils";

const TabList = styled(Box)(() => ({
  position: "relative",
  marginLeft: "-12px",
  [`& .${tabsClasses.root}`]: {
    minHeight: "0",
  },
  [`& .${tabsClasses.indicator}`]: {
    display: "none",
  },
}));

export const Notifications = ({ notifications }: NotificationProps) => {
  const [tab, setTab] = useState(0);

  const unresolved = notifications.filter((n) => !n.resolvedAt);
  const { current: activeNotifications } = partitionBySuperseded(unresolved);
  const resolvedNotifications = notifications.filter((n) => !!n.resolvedAt);
  const visibleNotifications =
    tab === 0 ? activeNotifications : resolvedNotifications;

  return (
    <Box sx={{ width: "100%", bgcolor: "background.paper" }}>
      <Box
        sx={(theme) => ({
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          bgcolor: "background.default",
          paddingTop: theme.spacing(3),
          [theme.breakpoints.up("lg")]: {
            paddingTop: theme.spacing(5),
          },
          borderBottom: `1px solid ${theme.palette.border.light}`,
        })}
      >
        <Container maxWidth="formWrap">
          <Typography variant="h2" component="h1" gutterBottom>
            Notifications
          </Typography>
          <TabList>
            <Tabs value={tab} onChange={(_, value) => setTab(value)}>
              <StyledTab
                label={`Active${activeNotifications.length ? ` (${activeNotifications.length})` : ""}`}
              />
              <StyledTab label="Resolved" />
            </Tabs>
          </TabList>
        </Container>
      </Box>
      <Container maxWidth="formWrap">
        {!visibleNotifications.length && (
          <WarningContainer>
            <Typography variant="body2">
              {tab === 0
                ? "No active notifications."
                : "No resolved notifications."}
            </Typography>
          </WarningContainer>
        )}
        {visibleNotifications.length > 0 && (
          <Stack sx={{ borderTop: "1px solid", borderColor: "border.main" }}>
            {visibleNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                statusLabel={tab === 1 ? "Resolved" : undefined}
              />
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
};

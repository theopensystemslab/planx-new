import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { WarningContainer } from "@planx/components/shared/Preview/WarningContainer";
import { useNavigate } from "@tanstack/react-router";
import { formatLastEditDate } from "pages/FlowEditor/utils";
import React from "react";
import SettingsSection from "ui/editor/SettingsSection";

import { NotificationCardProps, NotificationProps } from "./types";

export const Notifications = ({ notifications }: NotificationProps) => (
  <Container maxWidth="formWrap">
    <SettingsSection>
      <Typography variant="h2" component="h3" gutterBottom>
        Notifications
      </Typography>
      <Typography variant="body1">
        Alerts about your Plan✕ flows.
      </Typography>
    </SettingsSection>
    {!notifications.length && (
      <WarningContainer>
        <Typography variant="body2">
          No active notifications found.
        </Typography>
      </WarningContainer>
    )}
    {notifications.length > 0 &&
      notifications.map((notification) => (
        <NotificationCard notification={notification} />
      ))}
  </Container>
);

// TODO handle content dynamically based on `notification.type`
const NotificationCard = ({ notification }: NotificationCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate({ to: `/${notification.team.slug}/${notification.flow.slug}` });
  };

  return (
    <Card sx={{ maxWidth: "formWrap", marginBottom: 3 }}>
      <CardContent>
        <Typography gutterBottom variant="body2" sx={{ color: 'text.secondary' }}>
          {`Templated flow updated`}
        </Typography>
        <Typography gutterBottom variant="h4">
          {notification.flow.name}
        </Typography>
        <Typography gutterBottom variant="body2" sx={{ color: 'text.secondary' }}>
          {formatLastEditDate(notification.createdAt)}
        </Typography>
        <Typography variant="body2" sx={{ marginTop: 1 }}>
          Your templated flow has been updated and is ready to review and publish.
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          color="primary"
          onClick={handleClick}
        >
          Go to flow
        </Button>
      </CardActions>
    </Card>
  );
};

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import { SxProps, Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { formatLastEditDate } from "pages/FlowEditor/utils";
import React from "react";

import { Notification } from "./types";

export type NotificationStatus = "Resolved" | "Superseded";

export interface NotificationCardProps {
  notification: Notification;
  onGoToFlow: () => void;
  statusLabel?: NotificationStatus;
  sx?: SxProps<Theme>;
}

// TODO handle content dynamically based on `notification.type`
const NotificationCard = ({
  notification,
  onGoToFlow,
  statusLabel,
  sx,
}: NotificationCardProps) => (
  <Card sx={sx}>
    <CardContent>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 0.5,
        }}
      >
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Templated flow updated
        </Typography>
        {statusLabel && (
          <Chip
            label={statusLabel}
            size="small"
            color={statusLabel === "Resolved" ? "success" : "default"}
            sx={{ ml: 1, flexShrink: 0 }}
          />
        )}
      </Box>
      <Typography gutterBottom variant="h4">
        {notification.flow.name}
      </Typography>
      <Typography gutterBottom variant="body2" sx={{ color: "text.secondary" }}>
        {formatLastEditDate(notification.createdAt)}
      </Typography>
      <Typography variant="body2" sx={{ marginTop: 1 }}>
        Your templated flow has been updated and is ready to review and publish.
      </Typography>
    </CardContent>
    <CardActions>
      <Button variant="contained" color="primary" onClick={onGoToFlow}>
        Go to flow
      </Button>
    </CardActions>
  </Card>
);

export default NotificationCard;

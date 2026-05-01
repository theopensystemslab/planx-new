import Chip from "@mui/material/Chip";
import { SxProps, Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { formatLastEditDate } from "pages/FlowEditor/utils";
import {
  Card,
  CardBanner,
  CardContent,
  FlowCardLink,
} from "pages/Team/components/FlowCard/styles";
import { FlowTemplateIndicator } from "pages/Team/components/FlowTemplateIndicator";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

import { Notification } from "./types";

export type NotificationStatus = "Resolved" | "Superseded";

export interface NotificationCardProps {
  notification: Notification;
  statusLabel?: NotificationStatus;
  compact?: boolean;
  sx?: SxProps<Theme>;
}

// TODO handle content dynamically based on `notification.type`
const NotificationCard = ({
  notification,
  statusLabel,
  compact = false,
  sx,
}: NotificationCardProps) => (
  <Card sx={{ position: "relative", ...sx }}>
    <CardBanner
      sx={{
        justifyContent: "space-between",
        ...(compact && { py: 0.3, px: 1 }),
      }}
    >
      <FlowTemplateIndicator
        isSourceTemplate={false}
        isTemplatedFlow={true}
        teamName="Templated flow updated"
      />
      {statusLabel && (
        <Chip
          label={statusLabel}
          size="small"
          color={statusLabel === "Resolved" ? "success" : "default"}
          sx={{ flexShrink: 0, position: "relative", zIndex: 2 }}
        />
      )}
    </CardBanner>
    <CardContent sx={compact ? { py: 1.5, px: 1.25, gap: 0.5 } : { gap: 1 }}>
      <Typography
        variant={compact ? "body1" : "h4"}
        sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
      >
        {notification.flow.name}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {formatLastEditDate(notification.createdAt)}
      </Typography>
      <Typography variant={compact ? "body3" : "body2"}>
        Your templated flow has been updated and is ready to review and publish.
      </Typography>
    </CardContent>
    <FlowCardLink
      to="/app/$team/$flow"
      params={{ team: notification.team.slug, flow: notification.flow.slug }}
      aria-label={notification.flow.name}
      preload={false}
    />
  </Card>
);

export default NotificationCard;

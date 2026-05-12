import StarIcon from "@mui/icons-material/Star";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { styled, SxProps, Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { formatLastEditDate } from "pages/FlowEditor/utils";
import { FlowCardLink } from "pages/Team/components/FlowCard/styles";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import CheckCircleIcon from "ui/icons/CheckCircle";

import { Notification } from "./types";

export type NotificationStatus = "Resolved";

export interface NotificationCardProps {
  notification: Notification;
  statusLabel?: NotificationStatus;
  compact?: boolean;
  sx?: SxProps<Theme>;
}

const NotificationCard = styled("li")(({ theme }) => ({
  listStyle: "none",
  position: "relative",
  backgroundColor: theme.palette.common.white,
  borderBottom: `1px solid ${theme.palette.border.main}`,
  "&:hover": { backgroundColor: theme.palette.background.paper },
  "&:hover button": { backgroundColor: theme.palette.background.default },
}));

const StatusIndicator = styled(Box)(() => ({
  width: 20,
  height: 26,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
}));

const ActiveDot = styled(Box)(({ theme }) => ({
  width: 12,
  height: 12,
  borderRadius: "50%",
  backgroundColor: theme.palette.primary.main,
}));

const TemplateChip = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  borderRadius: "50px",
  padding: "2px 8px",
  border: "1px solid rgba(0, 0, 0, 0.2)",
  backgroundColor: theme.palette.template.main,
}));

// TODO handle content dynamically based on `notification.type`
const NotificationCardItem = ({
  notification,
  statusLabel,
  compact = false,
  sx,
}: NotificationCardProps) => (
  <NotificationCard sx={sx}>
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: compact ? 1 : 1.5,
        p: compact ? 1.5 : 2,
      }}
    >
      <StatusIndicator>
        {statusLabel === "Resolved" ? (
          <CheckCircleIcon
            sx={{ color: "success.main", width: 20, height: 20 }}
          />
        ) : (
          <ActiveDot sx={compact ? { width: 10, height: 10 } : undefined} />
        )}
      </StatusIndicator>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: compact ? 0.75 : 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <TemplateChip>
            <StarIcon sx={{ color: "#380F77", fontSize: "1rem" }} />
            <Typography
              variant="body3"
              sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
            >
              Templated flow updated
            </Typography>
          </TemplateChip>
          <Typography
            variant={compact ? "body3" : "body2"}
            sx={{ color: "text.secondary" }}
          >
            {formatLastEditDate(notification.createdAt)}
          </Typography>
        </Box>
        <Typography
          variant={compact ? "body1" : "h4"}
          sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
        >
          {notification.flow.name}
        </Typography>
        {!statusLabel && (
          <Button
            variant="contained"
            size="small"
            color="secondary"
            sx={{ fontSize: "0.875rem", width: "fit-content", mt: 0.25 }}
          >
            Review and publish
          </Button>
        )}
      </Box>
    </Box>
    <FlowCardLink
      to="/app/$team/$flow"
      params={{ team: notification.team.slug, flow: notification.flow.slug }}
      aria-label={notification.flow.name}
      preload={false}
    />
  </NotificationCard>
);

export default NotificationCardItem;

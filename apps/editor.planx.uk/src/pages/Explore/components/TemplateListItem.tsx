import Box from "@mui/material/Box";
import ListItemButton from "@mui/material/ListItemButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import CheckCircleIcon from "ui/icons/CheckCircle";

import { Badge } from "./Badge/Badge";
import { BadgeVariant } from "./Badge/types";
import type { Template } from "./types";

interface TemplateListItemProps {
  template: Template;
  onClick: (template: Template) => void;
}

export const TemplateListItem: React.FC<TemplateListItemProps> = ({
  template,
  onClick,
}) => {
  const [teamSlug, canUserEditTeam] = useStore((state) => [
    state.teamSlug,
    state.canUserEditTeam,
  ]);

  const isSubscribed =
    canUserEditTeam(teamSlug) && Boolean(template.subscribedTeams?.length);

  return (
    <ListItemButton
      onClick={() => onClick(template)}
      alignItems="flex-start"
      sx={{ px: 2, py: 1.5, gap: 1.5 }}
    >
      <Badge variant={BadgeVariant.SourceTemplate} sx={{ mt: 0.25 }} />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.25,
          justifyContent: "center",
          minHeight: "56px",
        }}
      >
        {isSubscribed && (
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.33, mt: 0.5 }}
          >
            <CheckCircleIcon color="success" sx={{ fontSize: 18 }} />
            <Typography
              variant="body3"
              sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
            >
              Subscribed
            </Typography>
          </Box>
        )}
        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
          {template.name}
        </Typography>
        {template.summary && (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {template.summary}
          </Typography>
        )}
      </Box>
    </ListItemButton>
  );
};

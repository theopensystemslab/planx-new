import Box from "@mui/material/Box";
import ListItemButton from "@mui/material/ListItemButton";
import Typography from "@mui/material/Typography";
import React from "react";

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
}) => (
  <ListItemButton
    onClick={() => onClick(template)}
    sx={{ px: 2, py: 1.5, gap: 1.5 }}
  >
    <Badge variant={BadgeVariant.SourceTemplate} />
    <Box>
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

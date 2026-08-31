import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

import type { SearchResultRelatedItems } from "./SearchResult";

interface RelatedItemsSectionProps {
  relatedItems: SearchResultRelatedItems;
  /** @default true */
  showDivider?: boolean;
}

export const RelatedItemsSection: React.FC<RelatedItemsSectionProps> = ({
  relatedItems,
  showDivider = true,
}) => (
  <>
    {showDivider && <Divider sx={{ my: 2 }} />}
    <Typography
      variant="body1"
      sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD, mb: 1.5 }}
    >
      {relatedItems.label}
    </Typography>
    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
      {relatedItems.items.map((item) => (
        <Tooltip key={item.key} title={item.tooltip}>
          <span>{item.icon}</span>
        </Tooltip>
      ))}
    </Box>
  </>
);

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import CheckCircleIcon from "ui/icons/CheckCircle";

import type { SearchResult } from "./SearchResult";

interface SearchListItemDetailProps {
  result: SearchResult;
}

export const SearchListItemDetail: React.FC<SearchListItemDetailProps> = ({
  result: {
    icon,
    sourceTeam,
    statusLabel,
    title,
    meta,
    tag,
    description,
    relatedItems,
  },
}) => {
  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        {icon}
        {sourceTeam && (
          <Typography
            variant="body1"
            sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
          >
            {sourceTeam}
          </Typography>
        )}
      </Box>
      {statusLabel && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.33, mb: 0.5 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 20 }} />
          <Typography
            variant="body2"
            sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
          >
            {statusLabel}
          </Typography>
        </Box>
      )}
      <Typography variant="h3" component="h2">
        {title}
      </Typography>
      {meta && (
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          {meta}
        </Typography>
      )}
      {tag && <Box sx={{ mt: 1.5, display: "flex" }}>{tag}</Box>}
      {description && (
        <Typography variant="body1" sx={{ mt: 2 }}>
          {description}
        </Typography>
      )}
      {relatedItems && relatedItems.items.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography
            variant="body1"
            sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD, mb: 1.5 }}
          >
            {relatedItems.label}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {relatedItems.items.map((item) => (
              <Tooltip key={item.key} title={item.tooltip}>
                <span>{item.icon}</span>
              </Tooltip>
            ))}
          </Box>
        </>
      )}
    </>
  );
};

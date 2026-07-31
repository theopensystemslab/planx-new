import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { ICONS } from "@planx/components/shared/icons";
import React, { useEffect, useState } from "react";
import { focusStyle, FONT_WEIGHT_SEMI_BOLD } from "theme";
import { AiChip } from "ui/editor/AiChip";

import type { ComponentItem } from "./componentData";

interface Props {
  item: ComponentItem;
  onClick: () => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export const ComponentRow: React.FC<Props> = ({
  item,
  onClick,
  scrollContainerRef,
}) => {
  const Icon = ICONS[item.type];
  const [tooltipOpen, setTooltipOpen] = useState(false);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onScroll = () => setTooltipOpen(false);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollContainerRef]);

  return (
    <Tooltip
      title={item.description}
      placement="right"
      arrow
      open={tooltipOpen}
      onOpen={() => setTooltipOpen(true)}
      onClose={() => setTooltipOpen(false)}
      slotProps={{ tooltip: { sx: { maxWidth: 240 } } }}
    >
      <Box
        component="button"
        type="button"
        onClick={onClick}
        data-component-type={item.type}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
          py: 0.875,
          width: "100%",
          border: 0,
          backgroundColor: "transparent",
          font: "inherit",
          color: "inherit",
          textAlign: "left",
          cursor: "pointer",
          "&:hover": {
            backgroundColor: "action.hover",
            "& .component-title": { fontWeight: FONT_WEIGHT_SEMI_BOLD },
          },
          "&:focus-visible": focusStyle,
        }}
      >
        {Icon && (
          <Box sx={{ flexShrink: 0, lineHeight: 0, color: "text.primary" }}>
            <Icon sx={{ fontSize: 20 }} />
          </Box>
        )}
        <Typography variant="body2" className="component-title">
          {item.title}
        </Typography>
        {item.hasAiVariant && <AiChip sx={{ ml: "auto" }} />}
      </Box>
    </Tooltip>
  );
};

import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";
import { focusStyle, FONT_WEIGHT_SEMI_BOLD } from "theme";

interface Props {
  onClick: () => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export const NoteRow: React.FC<Props> = ({ onClick, scrollContainerRef }) => {
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
      title="Add a note"
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
        data-component-type="note"
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
        <Box sx={{ flexShrink: 0, lineHeight: 0, color: "text.primary" }}>
          <StickyNote2Icon sx={{ fontSize: 20 }} />
        </Box>
        <Typography variant="body2" className="component-title">
          Note
        </Typography>
      </Box>
    </Tooltip>
  );
};

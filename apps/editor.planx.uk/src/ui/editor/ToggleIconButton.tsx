import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import React from "react";
import ToggleOverlayIcon from "ui/icons/ToggleOverlay";

interface ToggleIconButtonProps {
  isToggled: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  tooltip: string;
  ariaLabel: string;
}

const ToggleIconButton: React.FC<ToggleIconButtonProps> = ({
  isToggled,
  onToggle,
  icon,
  tooltip,
  ariaLabel,
}) => {
  return (
    <Tooltip title={tooltip} placement="right">
      <IconButton
        aria-label={ariaLabel}
        aria-pressed={isToggled}
        onClick={onToggle}
        size="large"
        sx={(theme) => ({
          position: "relative",
          background: theme.palette.background.paper,
          padding: theme.spacing(1),
          color: isToggled
            ? theme.palette.text.primary
            : theme.palette.text.disabled,

          "&:hover": {
            background: theme.palette.common.white,
          },
        })}
      >
        {icon}
        <Box
          sx={{
            position: "absolute",
            top: "55%",
            left: "48%",
            transform: "translate(-50%, -50%)",
            opacity: isToggled ? 0 : 1,
            transition: "opacity 0.2s ease-in-out",
          }}
        >
          <ToggleOverlayIcon />
        </Box>
      </IconButton>
    </Tooltip>
  );
};

export default ToggleIconButton;

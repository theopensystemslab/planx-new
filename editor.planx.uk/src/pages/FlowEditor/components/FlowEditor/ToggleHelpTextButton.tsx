import HelpTextOffIcon from "@mui/icons-material/DoNotDisturbOff";
import HelpTextIcon from "@mui/icons-material/Help";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

export const ToggleHelpTextButton: React.FC = () => {
  const [showHelpText, toggleShowHelpText] = useStore((state) => [
    state.showHelpText,
    state.toggleShowHelpText,
  ]);

  return (
    <Tooltip title="Toggle help text" placement="right">
      <IconButton
        aria-label="Toggle help text"
        onClick={toggleShowHelpText}
        size="large"
        sx={(theme) => ({
          background: theme.palette.background.paper,
          padding: theme.spacing(1),
          color: showHelpText
            ? theme.palette.text.primary
            : theme.palette.text.disabled,
          "&:hover": {
            background: theme.palette.common.white,
          },
        })}
      >
        {showHelpText ? <HelpTextIcon /> : <HelpTextOffIcon />}
      </IconButton>
    </Tooltip>
  );
};

import LabelIcon from "@mui/icons-material/Label";
import LabelOffIcon from "@mui/icons-material/LabelOff";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

export const ToggleTagsButton: React.FC = () => {
  const [showTags, toggleShowTags] = useStore((state) => [
    state.showTags,
    state.toggleShowTags,
  ]);

  return (
    <Tooltip title="Toggle tags" placement="right">
      <IconButton
        aria-label="Toggle tags"
        onClick={toggleShowTags}
        size="large"
        sx={(theme) => ({
          background: theme.palette.background.paper,
          padding: theme.spacing(1),
          borderRadius: "3px",
          color: showTags
            ? theme.palette.text.primary
            : theme.palette.text.disabled,
          "&:hover": {
            background: theme.palette.common.white,
          },
        })}
      >
        {showTags ? <LabelIcon /> : <LabelOffIcon />}
      </IconButton>
    </Tooltip>
  );
};

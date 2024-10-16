import ImageOffIcon from "@mui/icons-material/HideImage";
import ImageIcon from "@mui/icons-material/Image";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

export const ToggleImagesButton: React.FC = () => {
  const [showImages, toggleShowImages] = useStore((state) => [
    state.showImages,
    state.toggleShowImages,
  ]);

  return (
    <Tooltip title="Toggle images" placement="right">
      <IconButton
        aria-label="Toggle images"
        onClick={toggleShowImages}
        size="large"
        sx={(theme) => ({
          background: theme.palette.background.paper,
          padding: theme.spacing(1),
          color: showImages
            ? theme.palette.text.primary
            : theme.palette.text.disabled,
          "&:hover": {
            background: theme.palette.common.white,
          },
        })}
      >
        {showImages ? <ImageIcon /> : <ImageOffIcon />}
      </IconButton>
    </Tooltip>
  );
};

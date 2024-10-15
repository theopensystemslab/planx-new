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
    <Box
      sx={(theme) => ({
        position: "fixed",
        bottom: theme.spacing(10),
        left: theme.spacing(7),
        zIndex: theme.zIndex.appBar,
        border: `1px solid ${theme.palette.border.main}`,
        borderRadius: "3px",
        background: theme.palette.background.paper,
      })}
    >
      <Tooltip title="Toggle images" placement="right">
        <IconButton
          aria-label="Toggle images"
          onClick={toggleShowImages}
          size="large"
          sx={(theme) => ({
            padding: theme.spacing(1),
            color: showImages
              ? theme.palette.text.primary
              : theme.palette.text.disabled,
          })}
        >
          {showImages ? <ImageIcon /> : <ImageOffIcon />}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

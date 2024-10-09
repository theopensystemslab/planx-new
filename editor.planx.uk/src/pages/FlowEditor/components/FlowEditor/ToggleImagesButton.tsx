import ImageOffIcon from "@mui/icons-material/HideImage";
import ImageIcon from "@mui/icons-material/Image";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import { TooltipWrap } from "./ToggleTagsButton";

export const ToggleImagesButton: React.FC = () => {
  const [showImages, toggleShowImages] = useStore((state) => [
    state.showImages,
    state.toggleShowImages,
  ]);

  return (
    <Box
      sx={(theme) => ({
        position: "fixed",
        bottom: theme.spacing(2),
        left: theme.spacing(13),
        zIndex: theme.zIndex.appBar,
        border: `1px solid ${theme.palette.border.main}`,
        borderRadius: "3px",
        background: theme.palette.background.paper,
      })}
    >
      <TooltipWrap title="Toggle images">
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
      </TooltipWrap>
    </Box>
  );
};

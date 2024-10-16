import Box from "@mui/material/Box";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

export const Thumbnail: React.FC<{
  imageSource: string;
  imageAltText?: string;
}> = ({ imageSource, imageAltText }) => {
  const showImages = useStore((state) => state.showImages);
  if (!showImages) return null;

  return (
    <Box
      sx={{
        maxWidth: "220px",
        maxHeight: "220px",
        margin: "auto",
      }}
      component="img"
      src={imageSource}
      alt={imageAltText}
    />
  );
};

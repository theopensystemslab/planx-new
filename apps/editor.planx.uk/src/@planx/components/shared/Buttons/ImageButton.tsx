import ImageIcon from "@mui/icons-material/Image";
import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import { styled, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { useLayoutEffect, useRef, useState } from "react";
import Checkbox from "ui/shared/Checkbox/Checkbox";

import type { Props as ButtonBaseProps } from "./ButtonBase";

export interface Props extends ButtonBaseProps {
  title: string;
  description?: string;
  img?: string;
  checkbox?: boolean;
  selected: boolean;
}

const TextLabelRoot = styled(Box)(({ theme }) => ({
  width: "100%",
  pointerEvents: "none",
  display: "flex",
  flexGrow: 1,
  alignItems: "flex-start",
  padding: theme.spacing(1.5),
}));

const TextLabel = (props: Props): FCReturn => {
  const { selected, title, id, onClick } = props;
  const [multiline, setMultiline] = useState(false);
  const theme = useTheme();
  const textContentEl = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (textContentEl.current) {
      const totalHeight = textContentEl.current.offsetHeight;
      // It's possible to calculate the number of lines of text, but we need this
      // to align differently even if there is only one line of text in this
      // component but more in its neighbour
      if (totalHeight > 50) {
        setMultiline(true);
      }
    }
  });

  return (
    <TextLabelRoot
      {...({ ref: textContentEl } as any)}
      alignItems={multiline ? "flex-start" : "center"}
      sx={{ border: borderStyle(theme, selected), borderTop: "none" }}
    >
      <Checkbox id={id} checked={selected} onChange={onClick} />
      <Typography variant="body1" sx={{ ml: 1.5, mt: 0.9 }}>
        {title}
      </Typography>
    </TextLabelRoot>
  );
};

interface ImageLabelProps {
  selected: boolean;
  img?: string;
  alt?: string;
}

const borderStyle = (theme: Theme, selected: boolean) =>
  `2px solid ${
    selected ? theme.palette.primary.main : theme.palette.border.main
  }`;

const imageStyle = (theme: Theme): React.CSSProperties => ({
  width: `calc(100% - ${theme.spacing(2)})`,
  height: `calc(100% - ${theme.spacing(2)})`,
  position: "absolute",
  top: theme.spacing(1),
  left: theme.spacing(1),
  objectFit: "contain",
  backgroundColor: theme.palette.background.default,
});

const ImageLabelRoot = styled(Box)(({ theme }) => ({
  width: "100%",
  paddingTop: "100%",
  position: "relative",
  height: 0,
  overflow: "hidden",
  zIndex: 2,
  backgroundColor: theme.palette.background.default,
}));

const ImageError = styled(Box)(({ theme }) => ({
  ...imageStyle(theme),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.secondary.dark,
}));

const Image = styled("img")(({ theme }) => ({
  ...imageStyle(theme),
}));

const ImageLabel = (props: ImageLabelProps): FCReturn => {
  const { selected, img, alt } = props;
  const [imgError, setImgError] = useState(!(img && img.length));
  const theme = useTheme();
  const onError = () => {
    if (!imgError) {
      setImgError(true);
    }
  };

  return (
    <ImageLabelRoot
      sx={{ border: borderStyle(theme, selected), borderBottom: "none" }}
    >
      {imgError ? (
        <ImageError>
          <ImageIcon />
        </ImageError>
      ) : (
        <Image
          src={img}
          onError={onError}
          // Use a null alt to indicate that this image can be ignored by screen readers
          alt={alt || ""}
        />
      )}
    </ImageLabelRoot>
  );
};

function ImageResponse(props: Props): FCReturn {
  const { selected, img, checkbox, description, title, id } = props;
  const altText = description ? `${title} - ${description}` : title;

  return (
    <Box
      component="label"
      htmlFor={checkbox ? id : undefined}
      sx={{ cursor: "pointer" }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
        }}
        data-testid="image-button"
      >
        <ImageLabel selected={selected} img={img} alt={altText} />
        <TextLabel {...props} />
      </Box>
    </Box>
  );
}

export default ImageResponse;

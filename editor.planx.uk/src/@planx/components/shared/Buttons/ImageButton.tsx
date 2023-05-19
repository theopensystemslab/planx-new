import ImageIcon from "@mui/icons-material/Image";
import Box from "@mui/material/Box";
import { styled, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { useLayoutEffect, useRef, useState } from "react";
import Checkbox from "ui/Checkbox";

import ButtonBase, { Props as ButtonBaseProps } from "./ButtonBase";

export interface Props extends ButtonBaseProps {
  title: string;
  description?: string;
  responseKey?: string | number;
  img?: string;
  checkbox?: boolean;
  selected: boolean;
}

const imageStyle = {
  width: "100%",
  height: "100%",
  position: "absolute",
  top: 0,
  left: 0,
  objectFit: "contain",
  backgroundColor: "white",
} as const;

const ImageBox = styled(Box)(() => ({
  ...imageStyle,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "secondary.dark",
}));

const Image = styled("img")(() => ({
  ...imageStyle,
}));

interface TextLabelWrapperProps {
  selected: boolean;
  bgColor: string;
}

const TextLabelWrapper = styled(Box)<TextLabelWrapperProps>(
  ({ theme, selected, bgColor }) => ({
    width: "100%",
    backgroundColor: bgColor,
    color: selected ? theme.palette.primary.contrastText : "black",
    display: "flex",
    flexGrow: 1,
    padding: theme.spacing(1),
  })
);

const ImageButton = styled(ButtonBase)(() => ({
  alignItems: "flex-start",
}));

interface TextLabelProps extends Props {
  bgColor: string;
}

const TextLabel = (props: TextLabelProps): FCReturn => {
  const { selected, title, checkbox, id, onClick, description } = props;
  const [multiline, setMultiline] = useState(false);

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

  // Ensure we do not return one interactive element inside another (checkbox inside a button)
  if (checkbox) {
    return (
      <TextLabelWrapper
        {...({ ref: textContentEl } as any)}
        alignItems={multiline ? "flex-start" : "center"}
      >
        <Checkbox
          id={id}
          checked={selected}
          color={selected ? "primary.contrastText" : "text.primary"}
          onChange={onClick}
        />
        <Typography variant="body2" sx={{ ml: 1.5 }}>
          {title}
        </Typography>
      </TextLabelWrapper>
    );
  } else {
    const descriptionId = description ? `${id}-description` : undefined;
    return (
      <ImageButton selected={props.selected} onClick={props.onClick} id={id}>
        <Box {...({ ref: textContentEl } as any)} px={2.25} py={1.75}>
          <Typography
            variant="body1"
            sx={{ fontWeight: "bold" }}
            aria-describedby={descriptionId}
          >
            {title}
          </Typography>
          {Boolean(description) && (
            <Typography variant="body2" sx={{ mt: 1 }} id={descriptionId}>
              {description}
            </Typography>
          )}
        </Box>
      </ImageButton>
    );
  }
};

interface ImageLabelProps {
  bgColor: string;
  img?: string;
  alt?: string;
}

const ImageLabel = (props: ImageLabelProps): FCReturn => {
  const { bgColor, img, alt } = props;
  const [imgError, setImgError] = useState(!(img && img.length));
  const onError = () => {
    if (!imgError) {
      setImgError(true);
    }
  };

  return (
    <Box
      width="100%"
      paddingTop="100%"
      position="relative"
      height={0}
      overflow="hidden"
      border={`1px solid ${bgColor}`}
      zIndex={2}
      borderBottom="none"
      bgcolor="background.default"
    >
      {imgError ? (
        <ImageBox>
          <ImageIcon />
        </ImageBox>
      ) : (
        <Image
          src={img}
          onError={onError}
          // Use a null alt to indicate that this image can be ignored by screen readers
          alt={alt || ""}
        />
      )}
    </Box>
  );
};

function ImageResponse(props: Props): FCReturn {
  const { selected, img, checkbox, description, title, id } = props;
  const theme = useTheme();
  const bgColor = selected
    ? theme?.palette?.primary?.main
    : theme?.palette?.secondary?.main;

  const altText = description ? `${title} - ${description}` : title;

  return (
    <Box
      component="label"
      htmlFor={checkbox ? id : undefined}
      sx={{ cursor: "pointer" }}
    >
      <Box
        display="flex"
        flexDirection="column"
        width="100%"
        height="100%"
        data-testid="image-button"
      >
        <ImageLabel bgColor={bgColor} img={img} alt={altText} />
        <TextLabel bgColor={bgColor} {...props}></TextLabel>
      </Box>
    </Box>
  );
}

export default ImageResponse;

import ImageIcon from "@mui/icons-material/Image";
import Box from "@mui/material/Box";
import { Theme, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
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

const useStyles = makeStyles<Theme, Partial<TextLabelProps>>((theme) => {
  return {
    img: {
      width: "100%",
      height: "100%",
      position: "absolute",
      top: 0,
      left: 0,
      objectFit: "contain",
      backgroundColor: "white",
    },
    key: {
      opacity: 0.3,
    },
    keySelected: {
      opacity: 0.7,
    },
    title: {
      marginLeft: theme.spacing(1.5),
    },
    subtitle: {
      marginTop: theme.spacing(1),
    },
    bold: {
      fontWeight: 600,
    },
    label: {
      cursor: "pointer",
    },
    textLabelWrapper: {
      width: "100%",
      backgroundColor: (props) => props.bgColor,
      color: (props) =>
        props.selected ? theme.palette.primary.contrastText : "black",
      display: "flex",
      flexGrow: 1,
    },
    imageButton: {
      alignItems: "flex-start",
    },
  };
});

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

  const classes = useStyles(props);

  // Ensure we do not return one interactive element inside another (checkbox inside a button)
  if (checkbox) {
    return (
      <Box
        {...({ ref: textContentEl } as any)}
        alignItems={multiline ? "flex-start" : "center"}
        px={1}
        py={1}
        className={classes.textLabelWrapper}
      >
        <Checkbox
          id={id}
          checked={selected}
          color={selected ? "primary.contrastText" : "text.primary"}
          onChange={onClick}
        />
        <Typography variant="body2" className={classes.title}>
          {title}
        </Typography>
      </Box>
    );
  } else {
    const descriptionId = description ? `${id}-description` : undefined;
    return (
      <ButtonBase
        selected={props.selected}
        onClick={props.onClick}
        id={id}
        className={classes.imageButton}
      >
        <Box {...({ ref: textContentEl } as any)} px={2.25} py={1.75}>
          <Typography
            variant="body1"
            className={classes.bold}
            aria-describedby={descriptionId}
          >
            {title}
          </Typography>
          {Boolean(description) && (
            <Typography
              variant="body2"
              className={classes.subtitle}
              id={descriptionId}
            >
              {description}
            </Typography>
          )}
        </Box>
      </ButtonBase>
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
  const classes = useStyles(props);
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
        <Box
          className={classes.img}
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="secondary.dark"
        >
          <ImageIcon />
        </Box>
      ) : (
        <img
          className={classes.img}
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
  const classes = useStyles(props);
  const { selected, img, checkbox, description, title, id } = props;
  const theme = useTheme();
  const bgColor = selected
    ? theme?.palette?.primary?.main
    : theme?.palette?.secondary?.main;

  const altText = description ? `${title} - ${description}` : title;

  return (
    <label htmlFor={checkbox ? id : undefined} className={classes.label}>
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
    </label>
  );
}

export default ImageResponse;

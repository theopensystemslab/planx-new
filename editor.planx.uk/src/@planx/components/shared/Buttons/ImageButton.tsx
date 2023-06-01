import ImageIcon from "@mui/icons-material/Image";
import Box from "@mui/material/Box";
import { Theme, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import React, { useLayoutEffect, useRef, useState } from "react";
import Checkbox from "ui/Checkbox";

import { Props as ButtonBaseProps } from "./ButtonBase";

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
      width: `calc(100% - ${theme.spacing(2)})`,
      height: `calc(100% - ${theme.spacing(2)})`,
      position: "absolute",
      top: theme.spacing(1),
      left: theme.spacing(1),
      objectFit: "contain",
      backgroundColor: theme.palette.background.default,
    },
    title: {
      marginLeft: theme.spacing(1.5),
    },
    label: {
      cursor: "pointer",
    },
    textLabelWrapper: {
      width: "100%",
      border: "2px solid",
      borderColor: (props) => props.borderColor,
      borderTop: "none",
      display: "flex",
      flexGrow: 1,
      alignItems: "center",
      padding: theme.spacing(1.5),
      "& > p": {
        color: theme.palette.text.secondary,
      },
    },
  };
});

interface TextLabelProps extends Props {
  borderColor: string;
}

const TextLabel = (props: TextLabelProps): FCReturn => {
  const { selected, title, id, onClick } = props;
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
      <Typography variant="body1" className={classes.title}>
        {title}
      </Typography>
    </Box>
  );
};

interface ImageLabelProps {
  borderColor: string;
  img?: string;
  alt?: string;
}

const ImageLabel = (props: ImageLabelProps): FCReturn => {
  const { borderColor, img, alt } = props;
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
      border={`2px solid ${borderColor}`}
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
  const borderColor = selected
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
        <ImageLabel borderColor={borderColor} img={img} alt={altText} />
        <TextLabel borderColor={borderColor} {...props}></TextLabel>
      </Box>
    </label>
  );
}

export default ImageResponse;

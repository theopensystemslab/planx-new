import Box from "@material-ui/core/Box";
import { makeStyles, Theme, useTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import ImageIcon from "@material-ui/icons/Image";
import React, { useLayoutEffect, useRef, useState } from "react";
import Checkbox from "ui/Checkbox";

import ButtonBase, { Props as ButtonBaseProps } from "./ButtonBase";

export interface Props extends ButtonBaseProps {
  title: string;
  responseKey?: string | number;
  img?: string;
  checkbox?: boolean;
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
  };
});

interface TextLabelProps extends Props {
  bgColor: string;
}

const TextLabel = (props: TextLabelProps): FCReturn => {
  const { selected, title, checkbox, id, onClick } = props;
  const [multiline, setMultiline] = useState(false);

  const textContentEl = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (textContentEl.current) {
      const totalHeight = textContentEl.current.offsetHeight;
      // It's possible to calculate the number of lines of text, but we need this
      // to align differently even if there is only one line of text in this
      // component but more in its neighbor
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
    return (
      <ButtonBase selected={props.selected} onClick={props.onClick} id={id}>
        <Box {...({ ref: textContentEl } as any)} px={2.25} py={1.75}>
          <Typography variant="body2">{title}</Typography>
        </Box>
      </ButtonBase>
    );
  }
};

interface ImageLabelProps {
  bgColor: string;
  img?: string;
}

const ImageLabel = (props: ImageLabelProps): FCReturn => {
  const { bgColor, img } = props;
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
          alt=""
        />
      )}
    </Box>
  );
};

function ImageResponse(props: Props): FCReturn {
  const classes = useStyles(props);
  const { selected, img } = props;
  const theme = useTheme();
  const bgColor = selected
    ? theme?.palette?.primary?.main
    : theme?.palette?.secondary?.main;
  return (
    <label htmlFor={props.id} className={classes.label}>
      <Box display="flex" flexDirection="column" width="100%" height="100%">
        <ImageLabel bgColor={bgColor} img={img}></ImageLabel>
        <TextLabel bgColor={bgColor} {...props}></TextLabel>
      </Box>
    </label>
  );
}

export default ImageResponse;

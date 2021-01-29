import Box from "@material-ui/core/Box";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import ImageIcon from "@material-ui/icons/Image";
import React, { useLayoutEffect, useRef, useState } from "react";
import Checkbox from "ui/Checkbox";

import ButtonBase, { Props as ButtonProps } from "./ButtonBase";

export interface Props extends ButtonProps {
  id?: string;
  title: string;
  responseKey?: string | number;
  img?: string;
  checkbox?: boolean;
}

const useStyles = makeStyles((theme) => ({
  img: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    objectFit: "contain",
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
}));

function ImageResponse(props: Props) {
  const { selected, title, responseKey, img, checkbox } = props;
  const [imgError, setImgError] = useState(!(img && img.length));
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

  const theme = useTheme();

  const bgColor = selected
    ? theme.palette.primary.main
    : theme.palette.secondary.main;
  const classes = useStyles();

  const onError = () => {
    if (!imgError) {
      setImgError(true);
    }
  };

  return (
    <ButtonBase {...props}>
      <Box display="flex" flexDirection="column" width="100%" height="100%">
        <Box
          width="100%"
          paddingTop="100%"
          position="relative"
          height={0}
          overflow="hidden"
          border={`1px solid ${bgColor}`}
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
            <img className={classes.img} src={img} onError={onError} />
          )}
        </Box>
        {/*
          ref doesn't exist in the MUI type definitions, should be
          available in v5, sigh.

         https://github.com/mui-org/material-ui/issues/17010 
        */}
        <Box
          {...({ ref: textContentEl } as any)}
          width="100%"
          flexGrow={1}
          bgcolor={bgColor}
          color={selected ? "primary.contrastText" : "text.primary"}
          display="flex"
          justifyContent="space-between"
          px={checkbox ? 1 : 2.25}
          py={checkbox ? 1 : 1.75}
        >
          <Box
            display="flex"
            alignItems={multiline ? "flex-start" : "center"}
            height="100%"
          >
            {checkbox && (
              <Checkbox
                checked={selected}
                color={selected ? "primary.contrastText" : "text.primary"}
              />
            )}
            <Typography
              variant="body2"
              className={checkbox ? classes.title : undefined}
            >
              {title}
            </Typography>
          </Box>
          {responseKey && (
            <Typography
              variant="body2"
              className={selected ? classes.keySelected : classes.key}
            >
              {String(responseKey).toUpperCase()}
            </Typography>
          )}
        </Box>
      </Box>
    </ButtonBase>
  );
}

export default ImageResponse;

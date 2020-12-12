import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import ImageIcon from "@material-ui/icons/Image";
import React, { useState } from "react";
import Checkbox from "ui/Checkbox";

import theme from "../../../../theme";
import ButtonBase, { Props as ButtonProps } from "./ButtonBase";

export interface Props extends ButtonProps {
  title: string;
  responseKey?: string;
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
      <Box display="flex" flexDirection="column" width="100%">
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
        <Box
          width="100%"
          bgcolor={bgColor}
          color={selected ? "primary.contrastText" : "text.primary"}
          display="flex"
          justifyContent="space-between"
          px={checkbox ? 1 : 2.25}
          py={checkbox ? 1 : 1.75}
        >
          <Box display="flex" alignItems="center">
            {checkbox && (
              <Checkbox
                checked={selected}
                color={selected ? "primary.contrastText" : "text.primary"}
              />
            )}
            <Typography variant="body2" className={checkbox && classes.title}>
              {title}
            </Typography>
          </Box>
          <Typography
            variant="body2"
            className={selected ? classes.keySelected : classes.key}
          >
            {responseKey?.toUpperCase()}
          </Typography>
        </Box>
      </Box>
    </ButtonBase>
  );
}

export default ImageResponse;

import Box from "@material-ui/core/Box";
import ButtonBase from "@material-ui/core/ButtonBase";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import ImageIcon from "@material-ui/icons/Image";
import React, { useState } from "react";

import theme from "../../../../theme";

export interface Props {
  response: {
    id: string;
    responseKey: string;
    title: string;
    img?: string;
  };
  onClick: Function;
  selected: boolean;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
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
}));

function ImageResponse(props: Props) {
  const { selected, response } = props;
  const [imgError, setImgError] = useState(false);

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
    <ButtonBase className={classes.root} {...(props as any)}>
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
          >
            <ImageIcon />
          </Box>
        ) : (
          <img className={classes.img} src={response.img} onError={onError} />
        )}
      </Box>
      <Box
        width="100%"
        bgcolor={bgColor}
        color={selected ? "primary.contrastText" : "text.primary"}
        display="flex"
        justifyContent="space-between"
        px={2.25}
        py={1.75}
      >
        <Typography variant="body2">{response.title}</Typography>
        <Typography
          variant="body2"
          className={selected ? classes.keySelected : classes.key}
        >
          {response.responseKey.toUpperCase()}
        </Typography>
      </Box>
    </ButtonBase>
  );
}

export default ImageResponse;

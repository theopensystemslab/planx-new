import Box from "@material-ui/core/Box";
import ButtonBase from "@material-ui/core/ButtonBase";
// import ImageIcon from "@material-ui/icons/Image";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import classnames from "classnames";
import React from "react";

import theme from "../../../../theme";

export interface Props {
  selected?: boolean;
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
  const { selected } = props;
  const bgColor = selected
    ? theme.palette.primary.main
    : theme.palette.secondary.main;
  const classes = useStyles();

  return (
    <ButtonBase className={classes.root}>
      <Box
        width="100%"
        paddingTop={"100%"}
        position="relative"
        height={0}
        overflow="hidden"
        border={`1px solid ${bgColor}`}
        borderBottom="none"
        bgcolor="background.default"
      >
        {/* <img width="100%" height="auto" src="https://i.scdn.co/image/ab67616d00001e027159c7cb4d150eb7479c4cf7" /> */}
        <img
          className={classes.img}
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Candle.jpg/1200px-Candle.jpg"
        />
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
        <Typography variant="body2">This option</Typography>
        <Typography
          variant="body2"
          className={selected ? classes.keySelected : classes.key}
        >
          A
        </Typography>
      </Box>
    </ButtonBase>
  );
}

export default ImageResponse;

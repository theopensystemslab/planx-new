import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Close from "@material-ui/icons/Close";
import React, { useEffect, useLayoutEffect } from "react";

const useClasses = makeStyles((theme) => ({
  root: {
    padding: `${theme.spacing(4)}px ${theme.spacing(3)}px`,
    [theme.breakpoints.up("md")]: {
      padding: `${theme.spacing(10)}px ${theme.spacing(30)}px`,
    },
    outline: 0,
  },
  content: {
    marginTop: theme.spacing(2),
    whiteSpace: "pre-line",
    overflow: "scroll",
  },
  close: {
    position: "absolute",
    right: 20,
    top: 20,
  },
}));

function InformationPage(props: {
  header?: string;
  content?: string;
  onClose: () => void;
}) {
  const classes = useClasses();

  return (
    <Box
      width="100%"
      position="absolute"
      top={0}
      height="100%"
      bgcolor="background.default"
      display="flex"
      flexDirection="column"
      alignItems="center"
      py={2}
      overflow="scroll"
    >
      <IconButton
        onClick={props.onClose}
        className={classes.close}
        size="medium"
      >
        <Close />
      </IconButton>
      <Box maxWidth="768px" width="100%" py={5} px={2}>
        <Typography variant="h1">{props.header}</Typography>
        <Typography variant="body2" className={classes.content}>
          {props.content}
        </Typography>
      </Box>
    </Box>
  );
}

export default InformationPage;

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

function InformationalModal(props: {
  header?: string;
  content?: string;
  onClose: () => void;
}) {
  const classes = useClasses();

  // Don't let the body do weird stuff while the modal is displayed
  useLayoutEffect(() => {
    document.documentElement.style.overflow = "hidden";
    window.scrollTo(0, 0);

    return function cleanup() {
      document.documentElement.style.overflow = "scroll";
    };
  });

  return (
    <Box
      overflow="hidden"
      minHeight="100%"
      height="auto !important"
      width="100%"
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bgcolor="background.default"
      display="flex"
      flexDirection="column"
      alignItems="center"
      py={3}
      // TODO: This is the hard-coded height of the header; could be more elegant
      marginTop={9.375}
    >
      <IconButton
        onClick={props.onClose}
        className={classes.close}
        size="medium"
      >
        <Close />
      </IconButton>
      <Box
        maxWidth="768px"
        width="100%"
        pt={5}
        px={2}
        overflow="scroll"
        maxHeight="90%"
      >
        <Typography variant="h1">{props.header}</Typography>
        <Typography variant="body2" className={classes.content}>
          {props.content}
        </Typography>
      </Box>
    </Box>
  );
}

export default InformationalModal;

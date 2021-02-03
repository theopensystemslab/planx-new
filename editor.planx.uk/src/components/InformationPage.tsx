import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Close from "@material-ui/icons/Close";
import React from "react";

const useClasses = makeStyles((theme) => ({
  content: {
    marginTop: theme.spacing(2),
    whiteSpace: "pre-line",
  },
  close: {
    position: "absolute",
    right: 20,
    top: 20,
  },
}));

function InformationPage(props: {
  heading?: string;
  content?: string;
  onClose: () => void;
}) {
  const classes = useClasses();

  return (
    <Box
      width="100%"
      bgcolor="background.default"
      display="flex"
      flexDirection="column"
      alignItems="center"
      py={2}
    >
      <IconButton
        onClick={props.onClose}
        className={classes.close}
        size="medium"
      >
        <Close />
      </IconButton>
      <Box maxWidth="768px" width="100%" py={4} px={2}>
        <Typography variant="h1">{props.heading}</Typography>
        <Typography variant="body2" className={classes.content}>
          {props.content}
        </Typography>
      </Box>
    </Box>
  );
}

export default InformationPage;

import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Close from "@material-ui/icons/Close";
import React from "react";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";

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
      pt={2}
      pb={10}
    >
      <IconButton
        onClick={props.onClose}
        className={classes.close}
        size="medium"
      >
        <Close />
      </IconButton>
      <Container maxWidth="md">
        <Typography variant="h1">{props.heading}</Typography>
        <ReactMarkdownOrHtml source={props.content} />
      </Container>
    </Box>
  );
}

export default InformationPage;

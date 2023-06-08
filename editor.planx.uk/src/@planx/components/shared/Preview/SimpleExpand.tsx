import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import Caret from "ui/icons/Caret";

const useClasses = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  button: {
    boxShadow: "none",
    color: "black",
    fontSize: "1.125rem",
    fontWeight: "600",
    width: "100%",
    "& > svg": {
      marginLeft: "0.25em",
      color: theme.palette.text.secondary,
    },
  },
}));

const SimpleExpand = ({ children, buttonText }: any) => {
  const [show, setShow] = React.useState(false);
  const classes = useClasses();
  return (
    <>
      <Box className={classes.root}>
        <Button
          className={classes.button}
          onClick={() => setShow(!show)}
          aria-expanded={show}
          // Needs aria-controls
        >
          {show ? buttonText.closed : buttonText.open}
          <Caret />
        </Button>
      </Box>
      <Collapse in={show}>{children}</Collapse>
    </>
  );
};
export default SimpleExpand;

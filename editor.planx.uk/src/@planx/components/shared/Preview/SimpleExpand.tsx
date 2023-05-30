import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import Caret from "ui/icons/Caret";

const useClasses = makeStyles((theme: Theme) => ({
  button: {
    boxShadow: "none",
    color: theme.palette.text.primary,
    width: "100%",
    lineHeight: "1.333",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    "& > svg": {
      marginLeft: "0.25em",
      color: theme.palette.primary.main,
    },
  },
}));

const SimpleExpand = ({ children, buttonText }: any) => {
  const [show, setShow] = React.useState(false);
  const classes = useClasses();
  return (
    <>
      <Button
        size="large"
        disableRipple
        className={classes.button}
        onClick={() => setShow(!show)}
        // Needs aria-controls, aria-expanded
      >
        {show ? buttonText.closed : buttonText.open}
        <Caret expanded={show} />
      </Button>
      <Collapse in={show}>{children}</Collapse>
    </>
  );
};
export default SimpleExpand;

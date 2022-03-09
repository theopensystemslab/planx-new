import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Collapse from "@material-ui/core/Collapse";
import { makeStyles, Theme } from "@material-ui/core/styles";
import React from "react";

const useClasses = makeStyles((theme: Theme) => ({
  root: {
    paddingBottom: theme.spacing(0.5),
  },
}));

const SimpleExpand = ({ children, buttonText }: any) => {
  const [show, setShow] = React.useState(false);
  const classes = useClasses();
  return (
    <>
      <Box className={classes.root}>
        <Button
          size="large"
          fullWidth
          color="inherit"
          onClick={() => setShow(!show)}
        >
          {show ? buttonText.closed : buttonText.open}
        </Button>
      </Box>
      <Collapse in={show}>{children}</Collapse>
    </>
  );
};
export default SimpleExpand;

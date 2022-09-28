import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
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

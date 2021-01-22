import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Collapse from "@material-ui/core/Collapse";
import React from "react";

const SimpleExpand = ({ children, buttonText }: any) => {
  const [show, setShow] = React.useState(false);
  return (
    <>
      <Collapse in={show}>
        <div>{children}</div>
      </Collapse>
      <Box color="background.dark">
        <Button
          size="large"
          fullWidth
          color="inherit"
          onClick={() => setShow(!show)}
        >
          {show ? buttonText.closed : buttonText.open}
        </Button>
      </Box>
    </>
  );
};
export default SimpleExpand;

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import React from "react";

const SimpleExpand = ({ children, buttonText }: any) => {
  const [show, setShow] = React.useState(false);
  return (
    <>
      <Box sx={{ pb: 0.5 }}>
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

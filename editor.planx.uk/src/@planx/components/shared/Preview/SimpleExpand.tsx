import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import { styled } from "@mui/material/styles";
import React, { PropsWithChildren } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import Caret from "ui/icons/Caret";

const StyledButton = styled(Button)(() => ({
  boxShadow: "none",
  color: "black",
  fontSize: "1.125rem",
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  width: "100%",
}));

interface Props {
  buttonText: {
    open: string;
    closed: string;
  };
  id: string;
}

const SimpleExpand: React.FC<PropsWithChildren<Props>> = ({
  children,
  buttonText,
  id,
}) => {
  const [show, setShow] = React.useState(false);
  return (
    <>
      <Box mx={1}>
        <StyledButton
          onClick={() => setShow(!show)}
          aria-expanded={show}
          aria-controls={id}
        >
          {show ? buttonText.closed : buttonText.open}
          <Caret
            expanded={show}
            sx={{ ml: "0.25em", color: "text.secondary" }}
          />
        </StyledButton>
      </Box>
      <Collapse in={show} id={id}>
        {children}
      </Collapse>
    </>
  );
};
export default SimpleExpand;

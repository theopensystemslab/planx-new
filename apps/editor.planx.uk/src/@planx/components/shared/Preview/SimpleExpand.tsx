import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import { styled } from "@mui/material/styles";
import React, { PropsWithChildren } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import Caret from "ui/icons/Caret";

const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "lightFontStyle",
})<{ lightFontStyle: boolean }>(({ theme, lightFontStyle }) => ({
  boxShadow: "none",
  color: lightFontStyle ? theme.palette.grey[600] : "black",
  fontSize: lightFontStyle ? "1rem" : "1.125rem",
  fontWeight: lightFontStyle ? "inherit" : FONT_WEIGHT_SEMI_BOLD,
  width: "100%",
}));

interface Props {
  buttonText: {
    open: string;
    closed: string;
  };
  id: string;
  lightFontStyle?: boolean;
}

const SimpleExpand: React.FC<PropsWithChildren<Props>> = ({
  children,
  buttonText,
  id,
  lightFontStyle,
}) => {
  const [show, setShow] = React.useState(false);
  return (
    <>
      <Box>
        <StyledButton
          onClick={() => setShow(!show)}
          aria-expanded={show}
          aria-controls={id}
          lightFontStyle={lightFontStyle || false}
        >
          {show ? buttonText.closed : buttonText.open}
          <Caret
            expanded={show}
            sx={{ ml: "0.25em", color: "text.secondary" }}
          />
        </StyledButton>
      </Box>
      <Collapse in={show} id={id} data-testid={id}>
        {children}
      </Collapse>
    </>
  );
};
export default SimpleExpand;

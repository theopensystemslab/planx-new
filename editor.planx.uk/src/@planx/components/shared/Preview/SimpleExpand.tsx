import Box from "@mui/material/Box";
import Button, { ButtonProps } from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import { styled } from "@mui/material/styles";
import React, { PropsWithChildren } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import Caret from "ui/icons/Caret";

interface StyledButtonProps extends ButtonProps {
  show: boolean;
}

const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "show",
})<StyledButtonProps>(({ theme, show }) => ({
  boxShadow: "none",
  color: "black",
  fontSize: "1.125rem",
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  width: "100%",
  "& > svg": {
    marginLeft: "0.25em",
    color: theme.palette.text.secondary,
    ...(show && {
      transform: "rotate(180deg)",
    }),
  },
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
          show={show}
          aria-controls={id}
        >
          {show ? buttonText.closed : buttonText.open}
          <Caret />
        </StyledButton>
      </Box>
      <Collapse in={show} id={id}>
        {children}
      </Collapse>
    </>
  );
};
export default SimpleExpand;

import { styled } from "@mui/material/styles";
import React, { SyntheticEvent } from "react";
import { focusStyle } from "theme";

import { HEADER_HEIGHT_PUBLIC } from "./Header";

const Root = styled("a")(({ theme }) => ({
  width: "100vw",
  cursor: "pointer",
  height: HEADER_HEIGHT_PUBLIC / 2,
  backgroundColor: theme.palette.background.dark,
  color: theme.palette.common.white,
  textDecoration: "underline",
  padding: theme.spacing(1),
  paddingLeft: theme.spacing(3),
  // translate off-screen with absolute position
  position: "absolute",
  transform: "translateY(-100%)",
  "&:focus": {
    // bring it into view when accessed by tab
    transform: "translateY(0%)",
    position: "relative",
    ...focusStyle,
  },
}));

export const SkipLink: React.FC = () => {
  const handleClick = (e: SyntheticEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    handleActivation();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleActivation();
    }
  };

  const handleActivation = () => {
    const targetElement = document.getElementById("main-content");
    if (!targetElement) return;

    targetElement.focus();
    targetElement.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Root onClick={handleClick} onKeyDown={handleKeyDown} tabIndex={0}>
      Skip to main content
    </Root>
  );
};

export default SkipLink;

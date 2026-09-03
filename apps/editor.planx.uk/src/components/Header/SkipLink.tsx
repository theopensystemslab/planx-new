import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import type { SyntheticEvent } from "react";
import React from "react";
import { focusStyle } from "theme";

const Root = styled("a")(({ theme }) => ({
  width: "100vw",
  cursor: "pointer",
  backgroundColor: theme.palette.background.dark,
  color: theme.palette.common.white,
  padding: theme.spacing(0.5, 0),
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

const SkipLink: React.FC = () => {
  const handleClick = (e: SyntheticEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const targetElement = document.getElementById("main-content");
    if (!targetElement) return;

    targetElement.focus();
    targetElement.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Root href="#main-content" onClick={handleClick}>
      <Container maxWidth="contentWrap">Skip to main content</Container>
    </Root>
  );
};

export default SkipLink;

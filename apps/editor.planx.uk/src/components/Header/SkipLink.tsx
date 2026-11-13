import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import { getScrollBehavior } from "lib/reducedMotion";
import type { SyntheticEvent } from "react";
import { focusStyle } from "theme";

const Root = styled("a")(({ theme }) => ({
  display: "block",
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
    // Keep focus style visible above the downtime banner (which uses zIndex.appBar)
    zIndex: theme.zIndex.appBar + 1,
    ...focusStyle,
  },
}));

const SkipLink: React.FC = () => {
  const handleClick = (e: SyntheticEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const targetElement = document.getElementById("main-content");
    if (!targetElement) return;

    // Make <main> focusable only whilst it's the skip link target (matches GOV.UK Frontend)
    targetElement.setAttribute("tabindex", "-1");
    targetElement.addEventListener(
      "blur",
      () => targetElement.removeAttribute("tabindex"),
      { once: true },
    );
    targetElement.focus();
    targetElement.scrollIntoView({ behavior: getScrollBehavior() });
  };

  return (
    <Root href="#main-content" onClick={handleClick}>
      <Container maxWidth="contentWrap">Skip to main content</Container>
    </Root>
  );
};

export default SkipLink;

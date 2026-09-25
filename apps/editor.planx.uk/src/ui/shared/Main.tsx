import { styled } from "@mui/material/styles";
import type { PropsWithChildren } from "react";

const Root = styled("main")(() => ({
  width: "100%",
  "&:focus": {
    outline: "none",
    boxShadow: "none",
    border: "none",
  },
}));

// tabindex is applied temporarily by SkipLink when focusing this element
// A permanent tabindex would make <main> a mouse-focus target, stealing focus from widgets (e.g. clicking the address-autocomplete scrollbar)
const Main: React.FC<PropsWithChildren> = ({ children }) => (
  <Root id="main-content">{children}</Root>
);

export default Main;

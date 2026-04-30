import { styled } from "@mui/material/styles";
import React, { PropsWithChildren } from "react";

const Root = styled("main")(() => ({
  width: "100%",
  "&:focus": {
    outline: "none",
    boxShadow: "none",
    border: "none",
  },
}));

const Main: React.FC<PropsWithChildren> = ({ children }) => (
  <Root id="main-content" tabIndex={-1}>
    {children}
  </Root>
);

export default Main;

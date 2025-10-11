import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import React, { PropsWithChildren } from "react";

const Root = styled(Box)(() => ({
  width: "100%",
  "&:focus": {
    outline: "none",
    boxShadow: "none",
    border: "none",
  },
}));

const Main: React.FC<PropsWithChildren> = ({ children }) => (
  <Root component="main" id="main-content" tabIndex={-1}>
    {children}
  </Root>
);

export default Main;

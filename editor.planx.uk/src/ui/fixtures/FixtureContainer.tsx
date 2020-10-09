import { ThemeProvider } from "@material-ui/core/styles";
import React from "react";
import theme from "../../theme";

export default (props) => (
  <div style={{ padding: 80 }}>
    <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
  </div>
);

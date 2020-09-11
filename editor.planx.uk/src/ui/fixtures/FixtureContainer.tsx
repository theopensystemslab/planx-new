import React from "react";
import theme from "../../theme";
import ThemeProvider from "@material-ui/styles/ThemeProvider";

export default (props) => (
  <div style={{ padding: 80 }}>
    <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
  </div>
);

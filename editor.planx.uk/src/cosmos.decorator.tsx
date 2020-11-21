import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import theme from "./theme";

const Decorator = ({ children }) => {
  return (
    <div style={{ padding: 80 }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <DndProvider backend={HTML5Backend} key={Date.now()}>
          {children}
        </DndProvider>
      </ThemeProvider>
    </div>
  );
};

export default Decorator;

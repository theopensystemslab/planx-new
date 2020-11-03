import { ThemeProvider } from "@material-ui/core/styles";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import theme from "./theme";

const Decorator = ({ children }) => (
  <div style={{ padding: 80 }}>
    <DndProvider backend={HTML5Backend}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </DndProvider>
  </div>
);

export default Decorator;

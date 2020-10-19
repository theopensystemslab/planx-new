import { ThemeProvider } from "@material-ui/core/styles";
import React from "react";
import theme from "../../theme";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export default (props) => (
  <div style={{ padding: 80 }}>
    <DndProvider backend={HTML5Backend}>
      <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
    </DndProvider>
  </div>
);

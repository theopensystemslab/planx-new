import React from "react";
import theme from "../../theme";
import ThemeProvider from "@material-ui/styles/ThemeProvider";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export default (props) => (
  <DndProvider backend={HTML5Backend}>
    <div style={{ padding: 80 }}>
      <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
    </div>
  </DndProvider>
);

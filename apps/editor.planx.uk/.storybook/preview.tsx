import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { defaultTheme } from "../src/theme";
import React from "react";
import { MyMap } from "@opensystemslab/map";

import { reactNaviDecorator } from "./__mocks__/react-navi";

if (!window.customElements.get("my-map")) {
  window.customElements.define("my-map", MyMap);
}

export const decorators = [
  (Story) => (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <DndProvider backend={HTML5Backend} key={Date.now()}>
          <Story />
        </DndProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  ),
  reactNaviDecorator,
];
export const tags = ["autodocs"];

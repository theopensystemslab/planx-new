import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import globalTheme from "../src/theme";
import { reactNaviDecorator } from "./__mocks__/react-navi";

export const decorators = [
  (Story) => (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={globalTheme}>
        <CssBaseline />
        <DndProvider backend={HTML5Backend} key={Date.now()}>
          <Story />
        </DndProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  ),
  reactNaviDecorator
];

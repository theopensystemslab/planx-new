import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import theme from "../src/theme";
import { reactNaviDecorator } from "./__mocks__/react-navi";

export const decorators = [
  (Story) => (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DndProvider backend={HTML5Backend} key={Date.now()}>
        <Story />
      </DndProvider>
    </ThemeProvider>
  ),
  reactNaviDecorator
];

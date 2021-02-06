const CssBaseline = require("@material-ui/core/CssBaseline");
const React = require("react");
const { ThemeProvider } = require("@material-ui/core/styles");
const { DndProvider } = require("react-dnd");
const { HTML5Backend } = require("react-dnd-html5-backend");

const theme = require("../src/theme");

// export const decorators = [
//   (Story) => (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <DndProvider backend={HTML5Backend} key={Date.now()}>
//         <Story />
//       </DndProvider>
//     </ThemeProvider>
//   ),
// ];

const decorators = [
  (Story) =>
    React.createElement(
      ThemeProvider,
      { theme: theme },
      React.createElement(CssBaseline, null),
      React.createElement(
        DndProvider,
        { backend: HTML5Backend, key: Date.now() },
        React.createElement(Story, null)
      )
    ),
];

module.exports = { decorators };

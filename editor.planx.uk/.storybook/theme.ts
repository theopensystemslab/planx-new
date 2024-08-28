import { create } from "@storybook/theming/create";

export default create({
  base: "light",

  colorPrimary: "#0ECE83",
  colorSecondary: "rgba(0,0,0,0.4)",

  // UI
  appBg: "white",
  appContentBg: "#efefef",
  appBorderColor: "black",
  appBorderRadius: 0,

  // Typography
  fontBase: "'Inter', Arial",

  // Text colors
  textColor: "black",
  textInverseColor: "rgba(255,255,255,0.9)",

  // Toolbar default and active colors
  barTextColor: "silver",
  barSelectedColor: "black",
  barBg: "white",

  // Form colors
  inputBg: "white",
  inputBorder: "silver",
  inputTextColor: "black",
  inputBorderRadius: 4,

  brandTitle: "Open Systems Lab",
  brandUrl: "https://opensystemslab.io",
});

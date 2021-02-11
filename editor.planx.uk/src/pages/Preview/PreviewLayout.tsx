import Box from "@material-ui/core/Box";
import { createMuiTheme, Theme, ThemeProvider } from "@material-ui/core/styles";
import React from "react";
import { useCurrentRoute } from "react-navi";

import Footer from "../../components/Footer";
import Header from "../../components/Header";
import type { DesignSettings } from "../../types";

const PreviewLayout: React.FC<{
  children?: any;
  theme?: any;
  settings?: DesignSettings;
}> = ({
  theme = {
    primary: "#2c2c2c",
  },
  children,
  settings,
}) => {
  const { data } = useCurrentRoute();

  const makeHref = (path: string) => [data.mountpath, path].join("/");

  const leftFooterItems =
    settings?.privacy?.heading && settings?.privacy?.heading.length > 0
      ? [
          {
            title: "Privacy",
            href: makeHref("privacy"),
          },
        ]
      : undefined;

  const rightFooterItems =
    settings?.help?.heading && settings?.help?.heading.length > 0
      ? [
          {
            title: "Help",
            href: makeHref("help"),
            bold: true,
          },
        ]
      : undefined;

  const generatePreviewTheme = (baseTheme: Theme) =>
    theme.primary
      ? createMuiTheme({
          ...baseTheme,
          palette: {
            ...baseTheme.palette,
            primary: {
              main: theme.primary,
            },
          },
        })
      : baseTheme;

  return (
    <ThemeProvider theme={generatePreviewTheme}>
      <Header bgcolor={theme.primary} logo={theme.logo} phaseBanner />
      <Box
        pt={5}
        display="flex"
        flex="1 0 auto"
        flexDirection="column"
        alignItems="center"
        bgcolor="white"
        position="relative"
      >
        {children}
      </Box>

      <Footer leftItems={leftFooterItems} rightItems={rightFooterItems} />
    </ThemeProvider>
  );
};

export default PreviewLayout;

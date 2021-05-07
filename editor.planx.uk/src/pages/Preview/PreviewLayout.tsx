import Box from "@material-ui/core/Box";
import Link from "@material-ui/core/Link";
import { createMuiTheme, Theme, ThemeProvider } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useCurrentRoute } from "react-navi";
import Logo from "ui/images/OGLLogo.svg";

import Footer from "../../components/Footer";
import Header from "../../components/Header";
import type { FlowSettings } from "../../types";

const PreviewLayout: React.FC<{
  children?: any;
  theme?: any;
  settings?: FlowSettings;
}> = ({
  theme = {
    primary: "#2c2c2c",
  },
  children,
  settings,
}) => {
  const { data } = useCurrentRoute();

  const makeHref = (path: string) => [data.mountpath, path].join("/");

  const [id] = useStore((state) => [state.id]);

  const entry = `flow:${id}`;
  const localSession = (() => {
    try {
      const storage = localStorage.getItem(entry);
      if (storage) {
        return JSON.parse(storage);
      }
    } catch (err) {
      throw err;
    }
  })();

  const settingsLinks = (["help", "privacy"] as const).map((key) => {
    const setting = settings?.elements && settings?.elements[key];

    if (setting?.show) {
      return {
        title: setting.heading,
        href: makeHref(key),
        bold: key === "help",
      };
    }
  });

  const footerItems = [
    ...settingsLinks,
    {
      title: "Accessibility",
    },
    {
      title: "Terms of use",
    },
    {
      title: "Cookies",
    },
    {
      title: "Restart Application",
      onClick: () => {
        localSession && localStorage.removeItem(entry);
        window.location.reload();
      },
    },
  ].flatMap((x) => (x ? [x] : []));

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
        <ErrorBoundary
          FallbackComponent={({ error }) => <pre>{error.stack}</pre>}
        >
          {children}
        </ErrorBoundary>
      </Box>

      <Footer items={footerItems}>
        <Box display="flex" alignItems="center">
          <Box pr={3} display="flex">
            <img src={Logo} />
          </Box>
          <Typography variant="body2">
            All content is available under the{" "}
            <Link
              href="http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
              underline="always"
              color="inherit"
            >
              Open Government Licence v3
            </Link>
            , except where otherwise stated
          </Typography>
        </Box>
      </Footer>
    </ThemeProvider>
  );
};

export default PreviewLayout;

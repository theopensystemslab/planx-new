import Box from "@material-ui/core/Box";
import Link from "@material-ui/core/Link";
import {
  createMuiTheme,
  makeStyles,
  Theme,
  ThemeProvider,
} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import ErrorFallback from "components/ErrorFallback";
import { clearLocalFlow } from "lib/local";
import { merge } from "lodash";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useCurrentRoute } from "react-navi";
import { getGlobalThemeOptions, getTeamThemeOptions } from "theme";
import Logo from "ui/images/OGLLogo.svg";

import Footer from "../../components/Footer";
import Header, { HeaderVariant } from "../../components/Header";
import {
  ApplicationPath as AppPath,
  FlowSettings,
  FOOTER_ITEMS,
  Team,
  TextContent,
} from "../../types";
import ResumePage from "./ResumePage";
import SaveAndReturn from "./SaveAndReturn";
import SavePage from "./SavePage";

const useClasses = makeStyles((theme) => ({
  mainContainer: {
    borderTop: `1px solid ${theme.palette.grey[300]}`,
    paddingTop: theme.spacing(5),
    display: "flex",
    flex: "1 0 auto",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "white",
    position: "relative",
  },
}));

const PublicFooter: React.FC<{
  settings?: FlowSettings;
  footerContent?: { [key: string]: TextContent };
}> = ({ footerContent, settings }) => {
  const { data } = useCurrentRoute();

  const makeHref = (path: string) => [data.mountpath, "pages", path].join("/");

  const flowSettingsContent = FOOTER_ITEMS.map((key) => {
    const setting = settings?.elements && settings?.elements[key];

    if (setting?.show) {
      return {
        title: setting.heading,
        href: makeHref(key),
        bold: key === "help",
      };
    }
  });

  const globalFooterItems = footerContent
    ? Object.entries(footerContent).map(([slug, item]) => ({
        title: item.heading,
        content: item.content,
        href: makeHref(slug),
      }))
    : [];

  const footerItems = [...flowSettingsContent, ...globalFooterItems].filter(
    (item): item is { title: string; href: string; bold: boolean } =>
      Boolean(item)
  );
  return (
    <Footer items={[...footerItems]}>
      <Box display="flex" alignItems="center">
        <Box pr={3} display="flex">
          <img src={Logo} alt="Open Government License Logo" />
        </Box>
        <Typography variant="body2">
          All content is available under the{" "}
          <Link
            href="http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
            underline="always"
            color="inherit"
            target="_blank"
          >
            Open Government Licence v3
          </Link>
          , except where otherwise stated
        </Typography>
      </Box>
    </Footer>
  );
};

const PreviewLayout: React.FC<{
  team: Team;
  children?: any;
  settings?: FlowSettings;
  footerContent?: { [key: string]: TextContent };
  headerVariant: HeaderVariant;
}> = ({ team, children, settings, footerContent, headerVariant }) => {
  const classes = useClasses();
  const path = useStore((state) => state.path);

  const [id] = useStore((state) => [state.id]);

  const handleRestart = () => {
    if (
      confirm(
        "Are you sure you want to restart? This will delete your previous answers"
      )
    ) {
      clearLocalFlow(id);
      window.location.reload();
    }
  };

  /**
   * Generates a MuiTheme by deep merging global and team ThemeOptions
   * @returns {Theme}
   */
  const generatePreviewTheme = (): Theme => {
    const globalOptions = getGlobalThemeOptions();
    const teamOptions = getTeamThemeOptions(team.theme);
    return createMuiTheme(merge(globalOptions, teamOptions));
  };

  return (
    <ThemeProvider theme={generatePreviewTheme}>
      <Header
        team={team}
        handleRestart={handleRestart}
        variant={headerVariant}
      />
      <Box id="main-content" className={classes.mainContainer}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          {
            {
              [AppPath.SingleSession]: children,
              [AppPath.Save]: <SavePage />,
              [AppPath.Resume]: <ResumePage />,
              [AppPath.SaveAndReturn]: (
                <SaveAndReturn>{children}</SaveAndReturn>
              ),
            }[path]
          }
        </ErrorBoundary>
      </Box>
      <PublicFooter
        footerContent={footerContent}
        settings={settings}
      ></PublicFooter>
    </ThemeProvider>
  );
};

export default PreviewLayout;

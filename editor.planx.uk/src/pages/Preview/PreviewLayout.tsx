import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import {
  StyledEngineProvider,
  Theme,
  ThemeProvider,
} from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import ErrorFallback from "components/ErrorFallback";
import PhaseBanner from "components/PhaseBanner";
import { clearLocalFlow } from "lib/local";
import { NotFoundError } from "navi";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useCurrentRoute } from "react-navi";
import { generateTeamTheme } from "theme";
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

declare module "@mui/styles/defaultTheme" {
  interface DefaultTheme extends Theme {}
}

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
    <Box>
      <PhaseBanner />
      <Footer items={[...footerItems]}>
        <Box display="flex" alignItems="center">
          <Box pr={3} display="flex">
            <img src={Logo} alt="Open Government License Logo" />
          </Box>
          <Typography variant="body2">
            All content is available under the{" "}
            <Link
              href="http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
              color="inherit"
              target="_blank"
            >
              Open Government Licence v3
            </Link>
            , except where otherwise stated
          </Typography>
        </Box>
      </Footer>
    </Box>
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
  const id = useStore((state) => state.id);

  // Manually check for route errors
  // We're not yet within the NaviView which will automatically handle this
  // Save & Return "wrapper" must be resolved first
  const route = useCurrentRoute();
  if (route.error) throw new NotFoundError();

  const handleRestart = async () => {
    if (
      confirm(
        "Are you sure you want to restart? This will delete your previous answers"
      )
    ) {
      if (path === AppPath.SingleSession) {
        clearLocalFlow(id);
        window.location.reload();
      } else {
        // Save & Return flow
        // don't delete old flow for now
        // await NEW_LOCAL.clearLocalFlow(sessionId)
        const url = new URL(window.location.href);
        url.searchParams.delete("sessionId");
        window.location.href = url.href;
      }
    }
  };

  const teamTheme = generateTeamTheme(team.theme?.primary);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={teamTheme}>
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
    </StyledEngineProvider>
  );
};

export default PreviewLayout;

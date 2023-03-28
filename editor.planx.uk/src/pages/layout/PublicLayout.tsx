import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import {
  styled,
  StyledEngineProvider,
  ThemeProvider,
} from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import ErrorFallback from "components/ErrorFallback";
import PhaseBanner from "components/PhaseBanner";
import { PreviewContext } from "pages/Preview/Context";
import React, { PropsWithChildren } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useCurrentRoute } from "react-navi";
import { generateTeamTheme } from "theme";
import Logo from "ui/images/OGLLogo.svg";

import Footer from "../../components/Footer";
import Header, { HeaderVariant } from "../../components/Header";
import {
  Flow,
  FlowSettings,
  FOOTER_ITEMS,
  GlobalSettings,
  Team,
  TextContent,
} from "../../types";

interface StandalonePageProps {
  team: Team;
  footerContent?: { [key: string]: TextContent };
  settings?: FlowSettings;
  context: "Unpublished" | "Preview" | "Pay";
  flow?: Flow;
  globalSettings?: GlobalSettings;
}

const MainContainer = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.grey[300]}`,
  paddingTop: theme.spacing(5),
  display: "flex",
  flex: "1 0 auto",
  flexDirection: "column",
  alignItems: "center",
  backgroundColor: "white",
  position: "relative",
}));

export const PublicFooter: React.FC<{
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

const PublicLayout: React.FC<PropsWithChildren<StandalonePageProps>> = ({
  team,
  children,
  footerContent,
  settings,
  context,
  flow,
  globalSettings,
}) => {
  const teamTheme = generateTeamTheme(team.theme?.primary);
  // get better name for this! check blue trello
  const headerVariant = {
    Pay: HeaderVariant.Standalone,
    Preview: HeaderVariant.Preview,
    Unpublished: HeaderVariant.Unpublished,
  }[context];

  return (
    <PreviewContext.Provider value={{ flow, globalSettings }}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={teamTheme}>
          <Header team={team} variant={headerVariant} />
          <MainContainer id="main-content">
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              {children}
            </ErrorBoundary>
          </MainContainer>
          <PublicFooter
            footerContent={footerContent}
            settings={settings}
          ></PublicFooter>
        </ThemeProvider>
      </StyledEngineProvider>
    </PreviewContext.Provider>
  );
};

export default PublicLayout;

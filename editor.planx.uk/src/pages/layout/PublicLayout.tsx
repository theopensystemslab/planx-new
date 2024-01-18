import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import {
  styled,
  StyledEngineProvider,
  ThemeProvider,
} from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import ErrorFallback from "components/ErrorFallback";
import Feedback from "components/Feedback";
import PhaseBanner from "components/PhaseBanner";
import { hasFeatureFlag } from "lib/featureFlags";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { PropsWithChildren } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useCurrentRoute } from "react-navi";
import { generateTeamTheme } from "theme";
import Logo from "ui/images/OGLLogo.svg";

import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { FOOTER_ITEMS } from "../../types";

const MainContainer = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.border.light}`,
  display: "flex",
  flex: "1 0 auto",
  flexDirection: "column",
  alignItems: "center",
  backgroundColor: "white",
  position: "relative",
}));

const PublicFooter: React.FC = () => {
  const { data } = useCurrentRoute();
  const [flowSettings, globalSettings] = useStore((state) => [
    state.flowSettings,
    state.globalSettings,
  ]);

  const makeHref = (path: string) => [data.mountpath, "pages", path].join("/");

  const flowSettingsContent = FOOTER_ITEMS.map((key) => {
    const setting = flowSettings?.elements && flowSettings?.elements[key];

    if (setting?.show) {
      return {
        title: setting.heading,
        href: makeHref(key),
        bold: key === "help",
      };
    }
  });

  const globalFooterItems = globalSettings?.footerContent
    ? Object.entries(globalSettings?.footerContent).map(([slug, item]) => ({
        title: item.heading,
        content: item.content,
        href: makeHref(slug),
      }))
    : [];

  const footerItems = [...flowSettingsContent, ...globalFooterItems].filter(
    (item): item is { title: string; href: string; bold: boolean } =>
      Boolean(item),
  );

  const isUsingFeatureFlag = () => hasFeatureFlag("SHOW_INTERNAL_FEEDBACK");

  return (
    <Box>
      {isUsingFeatureFlag() ? <Feedback /> : <PhaseBanner />}
      <Footer items={[...footerItems]}>
        <Box display="flex" alignItems="center">
          <Box pr={2} display="flex">
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

const PublicLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const teamTheme = useStore((state) => state.teamTheme);
  const teamMUITheme = generateTeamTheme(teamTheme);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={teamMUITheme}>
        <Header />
        <MainContainer id="main-content">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            {children}
          </ErrorBoundary>
        </MainContainer>
        <PublicFooter />
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default PublicLayout;

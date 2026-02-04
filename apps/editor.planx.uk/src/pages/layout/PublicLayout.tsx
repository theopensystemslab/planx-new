import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import {
  styled,
  StyledEngineProvider,
  ThemeProvider,
} from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useLocation } from "@tanstack/react-router";
import ErrorFallback from "components/Error/ErrorFallback";
import Feedback from "components/Feedback";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { PropsWithChildren } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { generateTeamTheme } from "theme";
import Logo from "ui/images/OGLLogo.svg";

import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import { FOOTER_ITEMS } from "../../types";

const RootContainer = styled(Box)(() => ({
  flexGrow: "1",
  display: "grid",
  gridTemplateRows: "auto 1fr auto",
  gridTemplateColumns: "100%",
}));

const MainContainer = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.border.light}`,
  display: "flex",
  flex: "1 0 auto",
  flexDirection: "column",
  alignItems: "center",
  backgroundColor: "white",
  position: "relative",
  overflow: "hidden",
}));

const OglLogo = styled("img")(({ theme }) => ({
  paddingRight: theme.spacing(2),
  "@media print": {
    filter: "invert(1)",
  },
}));

const PublicFooter: React.FC = () => {
  const [flowSettings, globalSettings] = useStore((state) => [
    state.flowSettings,
    state.globalSettings,
  ]);

  const flowSettingsContent = FOOTER_ITEMS.map((key) => {
    const setting = flowSettings?.elements && flowSettings?.elements[key];

    if (setting?.show) {
      return {
        title: setting.heading,
        param: key,
        bold: key === "help",
      };
    }
  });

  const globalFooterItems = globalSettings?.footerContent
    ? Object.entries(globalSettings?.footerContent).map(([key, item]) => ({
        title: item.heading,
        content: item.content,
        param: key,
      }))
    : [];

  const footerItems = [...flowSettingsContent, ...globalFooterItems].filter(
    (item): item is { title: string; param: string; bold: boolean } =>
      Boolean(item),
  );

  return (
    <Box>
      <Feedback />
      <Footer items={[...footerItems]}>
        <Box display="flex" alignItems="center">
          <OglLogo src={Logo} alt="Open Government License Logo" />
          <Typography variant="body2">
            All content is available under the{" "}
            <Link
              href="http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
              color="inherit"
              target="_blank"
            >
              Open Government Licence v3 (opens in a new tab)
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
        <RootContainer data-testid="document-start">
          <Header />
          <MainContainer>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              {children}
            </ErrorBoundary>
          </MainContainer>
          <PublicFooter />
        </RootContainer>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default PublicLayout;

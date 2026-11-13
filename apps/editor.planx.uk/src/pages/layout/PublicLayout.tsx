import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import {
  styled,
  StyledEngineProvider,
  ThemeProvider,
} from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { AppErrorBoundary } from "components/Error/AppErrorBoundary";
import Feedback from "components/Feedback";
import ServiceToolbar from "components/ServiceToolbar";
import { useStore } from "pages/FlowEditor/lib/store";
import type { PropsWithChildren } from "react";
import { generateTeamTheme } from "theme";
import Logo from "ui/images/OGLLogo.svg";
import Main from "ui/shared/Main";

import ActiveDowntimeBanner from "../../components/DowntimeBanner/ActiveDowntimeBanner";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import SkipLink from "../../components/Header/SkipLink";
import { FOOTER_ITEMS } from "../../types";

const RootContainer = styled(Box)(() => ({
  flexGrow: "1",
  display: "grid",
  gridTemplateRows: "auto 1fr auto",
  gridTemplateColumns: "100%",
}));

const MainContainer = styled(Main)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
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
        <Box sx={{ display: "flex", alignItems: "center" }}>
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
          {/* Wrap skip link, downtime banner and header together to preserve layout */}
          <Box>
            <SkipLink />
            <ActiveDowntimeBanner variant="public" />
            <Header />
          </Box>
          <MainContainer>
            <AppErrorBoundary>{children}</AppErrorBoundary>
          </MainContainer>
          <PublicFooter />
          <ServiceToolbar />
        </RootContainer>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default PublicLayout;

import Box from "@mui/material/Box";
import {
  styled,
  StyledEngineProvider,
  Theme,
  ThemeProvider,
} from "@mui/material/styles";
import ErrorFallback from "components/ErrorFallback";
import Header, { HeaderVariant } from "components/Header";
import { PublicFooter } from "pages/Preview/PreviewLayout";
import React, { PropsWithChildren } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { generateTeamTheme } from "theme";
import { FlowSettings, Team, TextContent } from "types";

interface StandalonePageProps {
  team: Team;
  footerContent?: { [key: string]: TextContent };
  settings?: FlowSettings;
}

// TODO: DRY this up
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

const StandalonePage: React.FC<PropsWithChildren<StandalonePageProps>> = ({
  team,
  children,
  footerContent,
  settings,
}) => {
  const teamTheme = generateTeamTheme(team.theme?.primary);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={teamTheme}>
        <Header team={team} variant={HeaderVariant.Preview} />
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
  );
};

export default StandalonePage;

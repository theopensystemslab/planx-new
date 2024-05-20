import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import ErrorFallback from "components/ErrorFallback";
import { NotFoundError } from "navi";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { PropsWithChildren } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useCurrentRoute } from "react-navi";
import { generateTeamTheme } from "theme";

import Header from "../../components/Header";
import { MainContainer, PublicFooter } from "./PublicLayout";

const TestLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const teamTheme = useStore((state) => state.teamTheme);
  const teamMUITheme = generateTeamTheme(teamTheme);

  // Manually check for route errors
  // We're not yet within the NaviView which will automatically handle this
  // Save & Return "wrapper" must be resolved first
  const route = useCurrentRoute();
  if (route.error) throw new NotFoundError();

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={teamMUITheme}>
        <Header />
        <MainContainer>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            {children}
          </ErrorBoundary>
        </MainContainer>
        <PublicFooter />
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default TestLayout;

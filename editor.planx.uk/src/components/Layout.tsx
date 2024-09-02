import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import ErrorPage from "pages/ErrorPage";
import React, { useEffect } from "react";
import { NotFoundBoundary, useLoadingRoute } from "react-navi";

import { defaultTheme } from "../theme";
import DelayedLoadingIndicator from "./DelayedLoadingIndicator";

export const Layout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const isLoading = useLoadingRoute();

  useEffect(() => {
    const observer = new MutationObserver(() => {
      // set the page title based on whatever heading is currently shown
      // on screen. If there's no heading then the title will be "PlanX"
      document.title = [
        document.querySelector("[role=heading],h1,h2,h3")?.textContent,
        "PlanX",
      ]
        .filter(Boolean)
        .join(" - ");
    });

    observer.observe(document.getElementById("root")!, {
      attributes: false,
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={defaultTheme}>
        <NotFoundBoundary render={() => <ErrorPage title="Not found" />}>
          {isLoading ? (
            <DelayedLoadingIndicator msDelayBeforeVisible={500} />
          ) : (
            children
          )}
        </NotFoundBoundary>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

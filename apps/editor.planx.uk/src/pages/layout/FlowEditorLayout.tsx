import { useLocation } from "@tanstack/react-router";
import ErrorFallback from "components/Error/ErrorFallback";
import FlowEditor from "pages/FlowEditor";
import React, { PropsWithChildren } from "react";
import { ErrorBoundary } from "react-error-boundary";

const FlowEditorLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const location = useLocation();
  const isMenuRoute =
    location.pathname.includes("/about") ||
    location.pathname.includes("/settings") ||
    location.pathname.includes("/feedback") ||
    location.pathname.includes("/submissions");

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {!isMenuRoute && <FlowEditor />}
      {children}
    </ErrorBoundary>
  );
};

export default FlowEditorLayout;

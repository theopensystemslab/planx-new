import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import EditorNavMenu, { flowLayoutRoutes } from "components/EditorNavMenu";
import ErrorFallback from "components/ErrorFallback";
import React, { PropsWithChildren } from "react";
import { ErrorBoundary } from "react-error-boundary";

const Root = styled(Box)(() => ({
  display: "flex",
  alignItems: "stretch",
  overflow: "hidden",
  flexGrow: 1,
}));

const FlowEditorLayout: React.FC<PropsWithChildren> = ({ children }) => (
  <Root>
    <EditorNavMenu compact routes={flowLayoutRoutes} />
    <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
  </Root>
);

export default FlowEditorLayout;

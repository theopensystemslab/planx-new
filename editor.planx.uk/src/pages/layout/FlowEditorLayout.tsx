import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import ErrorFallback from "components/ErrorFallback";
import { hasFeatureFlag } from "lib/featureFlags";
import EditorMenu from "pages/FlowEditor/components/EditorMenu";
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
    {hasFeatureFlag("EDITOR_NAVIGATION") && <EditorMenu />}
    <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
  </Root>
);

export default FlowEditorLayout;

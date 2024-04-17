import React, { PropsWithChildren } from "react";
import EditorMenu from "pages/FlowEditor/components/EditorMenu";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "components/ErrorFallback";

const Root = styled(Box)(() => ({
  display: "flex",
  alignItems: "stretch",
  overflow: "hidden",
  flexGrow: 1,
}))

const FlowEditorLayout: React.FC<PropsWithChildren> = ({ children }) => (
  <Root>
    <EditorMenu />
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ErrorBoundary>
  </Root>
);

export default FlowEditorLayout;



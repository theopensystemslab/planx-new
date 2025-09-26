import ErrorFallback from "components/Error/ErrorFallback";
import FlowEditor from "pages/FlowEditor";
import React, { PropsWithChildren } from "react";
import { ErrorBoundary } from "react-error-boundary";

type Props = PropsWithChildren<{
  flow: string;
  breadcrumbs?: string[];
}>

const FlowEditorLayout: React.FC<Props> = ({ children, ...props }) => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <FlowEditor {...props}/>
    {children}
  </ErrorBoundary>
);

export default FlowEditorLayout;

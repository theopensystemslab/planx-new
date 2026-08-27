import React, { type ComponentType, type PropsWithChildren } from "react";
import type {
  ErrorBoundaryProps,
  FallbackProps,
  OnErrorCallback,
} from "react-error-boundary";
// eslint-disable-next-line no-restricted-imports
import { ErrorBoundary } from "react-error-boundary";

import ErrorFallback from "./ErrorFallback";
import { logError } from "./logError";

type AppErrorBoundaryProps = PropsWithChildren<{
  FallbackComponent?: ComponentType<FallbackProps>;
  disableReporting?: boolean;
  onError?: OnErrorCallback;
  onReset?: ErrorBoundaryProps["onReset"];
  resetKeys?: ErrorBoundaryProps["resetKeys"];
}>;

/**
 * Wraps `react-error-boundary` so that every caught error is reported
 * to Airbrake with its React component stack via logError()
 */
export const AppErrorBoundary: React.FC<AppErrorBoundaryProps> = ({
  children,
  FallbackComponent = ErrorFallback,
  disableReporting = false,
  onError,
  ...props
}) => (
  <ErrorBoundary
    FallbackComponent={FallbackComponent}
    onError={(error, info) => {
      if (!disableReporting) logError(error, info);
      onError?.(error, info);
    }}
    {...props}
  >
    {children}
  </ErrorBoundary>
);

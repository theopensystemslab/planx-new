import { logger } from "airbrake";
import type { ErrorInfo } from "react";

import { isGraphError } from "./GraphError";

export const logError = (error: unknown, info: ErrorInfo): void => {
  if (isGraphError(error)) return;

  logger.notify({ error, params: { componentStack: info.componentStack } });
};

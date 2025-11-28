import { Operation } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { logger } from "airbrake";
import { GraphQLFormattedError } from "graphql";
import { useStore } from "pages/FlowEditor/lib/store";
import { toast } from "react-toastify";

import { handleExpiredJWTErrors } from "./auth";

const toastId = "error_toast";

export const errorLink = onError(({ graphQLErrors, operation }) => {
  if (graphQLErrors) {
    handleHasuraGraphQLErrors(graphQLErrors, operation);
  } else {
    console.error(`[Network Error]: ${operation.operationName}`);
    toast.error("Network error, attempting to reconnect…", {
      toastId,
      autoClose: false,
      hideProgressBar: true,
      progress: undefined,
    });
  }
});

const handleHasuraGraphQLErrors = (
  errors: ReadonlyArray<GraphQLFormattedError>,
  operation: Operation,
) => {
  errors.forEach(({ message, locations, path }) => {
    console.error(
      `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
    );

    const errorTypes = parseErrorTypeFromHasuraResponse(message);

    if (errorTypes.expiredJWT) handleExpiredJWTErrors();
    if (errorTypes.validation) handleValidationErrors(operation);
    if (errorTypes.permission) handlePermissionErrors(operation);
  });
};

const parseErrorTypeFromHasuraResponse = (message: string) => {
  const permissionErrors = [
    // Constraints error - user does not have access to this resource
    /permission has failed/gi,
    // Query or mutation error - user does not have access to this query
    /not found in type/gi,
  ];
  const validationErrors = [/Invalid HTML content/gi];
  const expiredJWTError = [/Could not verify JWT: JWTExpired/gi];

  return {
    permission: permissionErrors.some((re) => re.test(message)),
    validation: validationErrors.some((re) => re.test(message)),
    expiredJWT: expiredJWTError.some((re) => re.test(message)),
  };
};

const handleValidationErrors = (operation: Operation) => {
  const user = useStore.getState().user;
  logger.notify(
    `[Validation error]: User ${user?.id} cannot submit invalid HTML via ${operation.operationName} mutation`,
  );
  toast.error("Validation error - data not saved", {
    toastId: "validation_error",
    hideProgressBar: true,
  });
};

const handlePermissionErrors = (operation: Operation) => {
  const user = useStore.getState().user;
  const team = useStore.getState().teamName;
  logger.notify(
    `[Permission error]: User ${user?.id} cannot execute ${operation.operationName} for ${team}`,
  );
  toast.error("Permission error", {
    toastId: "permission_error",
    hideProgressBar: true,
  });
};

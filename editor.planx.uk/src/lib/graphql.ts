import {
  ApolloClient,
  createHttpLink,
  DefaultContext,
  from,
  InMemoryCache,
  Operation,
  split,
} from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { logger } from "airbrake";
import { useStore } from "pages/FlowEditor/lib/store";
import { toast } from "react-toastify";

const toastId = "error_toast";

// function used to verify response status
const customFetch = async (
  input: RequestInfo,
  init?: RequestInit,
): Promise<Response> => {
  const fetchResult = await fetch(input, init);
  // eslint-disable-next-line no-prototype-builtins
  const isGraphQLError = fetchResult.body?.hasOwnProperty("errors");
  const isSuccess =
    isGraphQLError || (fetchResult.status >= 200 && fetchResult.status <= 299);
  if (isSuccess) {
    // NB: it's okay if toast.dismiss() gets called more than once
    toast.dismiss(toastId);
  }

  return fetchResult;
};

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_APP_HASURA_URL,
  fetch: customFetch,
});

/**
 * Set auth header in Apollo client
 * Must be done post-authentication once we have a value for JWT
 */
export const authMiddleware = setContext(async () => {
  const jwt = await getJWT();

  return {
    headers: {
      authorization: jwt ? `Bearer ${jwt}` : undefined,
    },
  };
});

const authHttpLink = authMiddleware.concat(httpLink);

/**
 * Authenticated web socket connection - used for GraphQL subscriptions
 */
const authWsLink = new WebSocketLink({
  uri: import.meta.env.VITE_APP_HASURA_WEBSOCKET!,
  options: {
    reconnect: true,
    connectionParams: async () => {
      const jwt = await getJWT();
      return {
        headers: {
          authorization: jwt ? `Bearer ${jwt}` : undefined,
        },
      };
    },
  },
});

/**
 * Split requests between HTTPS and WS, based on operation types
 *  - Queries and mutations -> HTTPS
 *  - Subscriptions -> WS
 */
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  authWsLink,
  authHttpLink,
);

const publicHttpLink = createHttpLink({
  uri: import.meta.env.VITE_APP_HASURA_URL,
  fetch: customFetch,
  headers: { "x-hasura-role": "public" },
});

const errorLink = onError(({ graphQLErrors, operation }) => {
  if (graphQLErrors) {
    handleHasuraGraphQLErrors(graphQLErrors, operation);
  } else {
    console.error(
      `[Error]: Operation name: ${
        operation.operationName
      }. Details: ${JSON.stringify(operation)}`,
    );
    toast.error("Network error, attempting to reconnect…", {
      toastId,
      autoClose: false,
      hideProgressBar: true,
      progress: undefined,
    });
  }
});

const handleHasuraGraphQLErrors = (
  errors: GraphQLErrors,
  operation: Operation,
) => {
  errors.forEach(({ message, locations, path }) => {
    console.error(
      `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
    );

    const errors = parseErrorTypeFromHasuraResponse(message);

    if (errors.expiredJWT) handleExpiredJWTErrors();
    if (errors.validation) handleValidationErrors(operation);
    if (errors.permission) handlePermissionErrors(operation);
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

const handleExpiredJWTErrors = () => (window.location.href = "/logout");

const handleValidationErrors = (operation: Operation) => {
  const user = useStore.getState().getUser();
  logger.notify(
    `[Validation error]: User ${user?.id} cannot submit invalid HTML via ${operation.operationName} mutation`,
  );

  toast.error("Validation error - data not saved", {
    toastId: "validation_error",
    hideProgressBar: true,
    progress: undefined,
  });
};

const handlePermissionErrors = (operation: Operation) => {
  const user = useStore.getState().getUser();
  const team = useStore.getState().teamName;
  logger.notify(
    `[Permission error]: User ${user?.id} cannot execute ${operation.operationName} for ${team}`,
  );

  toast.error("Permission error", {
    toastId: "permission_error",
    hideProgressBar: true,
    progress: undefined,
  });
};

const retryLink = new RetryLink({
  delay: {
    initial: 500,
    max: Infinity,
  },
  attempts: {
    max: Infinity,
  },
});

/**
 * Get the JWT from the store, and wait if not available
 */
const getJWT = async () => {
  const jwt = useStore.getState().jwt;
  if (jwt) return jwt;

  return await waitForAuthentication();
};

/**
 * Wait for authentication by subscribing to the JWT changes
 */
const waitForAuthentication = async () =>
  new Promise<string>((resolve) => {
    const unsubscribe = useStore.subscribe(({ jwt }) => {
      if (jwt) {
        unsubscribe();
        resolve(jwt);
      }
    });
  });

/**
 * Client used to make all requests by authorised users
 */
export const client = new ApolloClient({
  link: from([retryLink, errorLink, splitLink]),
  cache: new InMemoryCache(),
});

/**
 * Client used to make requests in all public interface
 * e.g. /published, /preview, /draft, /pay
 */
export const publicClient = new ApolloClient({
  link: from([retryLink, errorLink, publicHttpLink]),
  cache: new InMemoryCache(),
});

/**
 * Explicitly connect to Hasura using the "public" role
 * Allows authenticated users with a different x-hasura-default-role (e.g. teamEditor, platformAdmin) to access public resources
 */
export const publicContext: DefaultContext = {
  headers: {
    "x-hasura-role": "public",
  },
};

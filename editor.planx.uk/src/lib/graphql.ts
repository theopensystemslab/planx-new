import { DefaultContext } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { RetryLink } from "@apollo/client/link/retry";
import { useStore } from "pages/FlowEditor/lib/store";

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

export const retryLink = new RetryLink({
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
export const getJWT = async () => {
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
 * Explicitly connect to Hasura using the "public" role
 * Allows authenticated users with a different x-hasura-default-role (e.g. teamEditor, platformAdmin) to access public resources
 */
export const publicContext: DefaultContext = {
  headers: {
    "x-hasura-role": "public",
  },
};

import { useStore } from "pages/FlowEditor/lib/store";
import { toast } from "react-toastify";

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

export const handleExpiredJWTErrors = () => {
  toast.error(
    "[GraphQL error]: Session expired, redirecting to login page...",
    {
      toastId: "hasura_jwt_expiry_error",
      hideProgressBar: false,
      progress: undefined,
      autoClose: 4_000,
      onClose: () => (window.location.href = "/logout"),
    },
  );

  // Fallback if case of toast not firing
  setTimeout(() => {
    window.location.href = "/logout";
  }, 2_500);
};

/**
 * Public Context helper
 */
export const publicContext = {
  role: "public",
};

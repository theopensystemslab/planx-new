import { useStore } from "pages/FlowEditor/lib/store";
import { useEffect, useState } from "react";

/**
 * Send the user to the API's Stripe connect route, optionally for one of the team's named accounts
 */
export const useRedirectToStripe = () => {
  const teamSlug = useStore((state) => state.teamSlug);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // if browser uses bfcache'd page, clear the isRedirecting boolean
  useEffect(() => {
    const resetOnRestore = (event: PageTransitionEvent) => {
      if (event.persisted) setIsRedirecting(false);
    };
    window.addEventListener("pageshow", resetOnRestore);
    return () => window.removeEventListener("pageshow", resetOnRestore);
  }, []);

  const redirectToStripe = (account?: string) => {
    setIsRedirecting(true);
    const query = account ? `?${new URLSearchParams({ account })}` : "";
    window.location.href = `${import.meta.env.VITE_APP_API_URL}/stripe/connect/${teamSlug}${query}`;
  };

  return { isRedirecting, redirectToStripe };
};

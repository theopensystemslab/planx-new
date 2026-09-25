import { useEffect } from "react";
import { withEnvironmentTag } from "utils/pageTitle";

/**
 * Pages which set their own title per route via `head`
 */
const hasRouteTitle = () => {
  const { pathname } = window.location;
  return pathname.startsWith("/app") || pathname === "/login";
};

/**
 * Sets the page title based heirarchy of headings (defaults to PlanX if no headings present)
 * Titles are tagged with the current environment, eg "[staging]"
 *
 * Editor and login pages are skipped - their titles are set per route via `head`
 */
const usePageTitleFromHeading = () => {
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (hasRouteTitle()) return;

      const title = [
        document.querySelector("[role=heading],h1,h2,h3")?.textContent,
        "PlanX",
      ]
        .filter(Boolean)
        .join(" - ");

      document.title = withEnvironmentTag(title);
    });

    observer.observe(document.getElementById("root")!, {
      attributes: false,
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);
};

export default usePageTitleFromHeading;

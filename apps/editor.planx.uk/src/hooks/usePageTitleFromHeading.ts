import { useEffect } from "react";
import { withEnvironmentTag } from "utils/pageTitle";

const isEditorPage = () => window.location.pathname.startsWith("/app");

/**
 * Sets the page title based heirarchy of headings (defaults to PlanX if no headings present)
 * Titles are tagged with the current environment, eg "[staging]"
 *
 * Editor pages are skipped - their titles are set per route via `head` (see utils/pageTitle.ts)
 */
const usePageTitleFromHeading = () => {
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (isEditorPage()) return;

      const title = [
        document.querySelector("[role=heading],h1,h2,h3")?.textContent,
        "Plan✕",
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

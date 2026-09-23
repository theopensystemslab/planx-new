import { useEffect } from "react";

const ENVIRONMENT_TITLE_TAGS: Record<string, string> = {
  staging: "[staging]",
  pizza: "[pizza]",
  development: "[local]",
};

/**
 * Sets the page title based heirarchy of headings (defaults to PlanX if no headings present)
 * Editor (non-public) pages are tagged with the current environment, eg "[staging]"
 */
const usePageTitleFromHeading = () => {
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isEditorPage = window.location.pathname.startsWith("/app");
      const environmentTag = isEditorPage
        ? ENVIRONMENT_TITLE_TAGS[import.meta.env.VITE_APP_ENV]
        : undefined;

      const title = [
        document.querySelector("[role=heading],h1,h2,h3")?.textContent,
        "PlanX",
      ]
        .filter(Boolean)
        .join(" - ");

      document.title = environmentTag ? `${environmentTag} ${title}` : title;
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

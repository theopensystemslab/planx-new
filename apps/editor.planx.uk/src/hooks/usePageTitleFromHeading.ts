import { useEffect } from "react";

/**
 * Sets the page title based heirarchy of headings (defaults to PlanX if no headings present)
 */
const usePageTitleFromHeading = () => {
  useEffect(() => {
    const observer = new MutationObserver(() => {
      document.title = [
        document.querySelector("[role=heading],h1,h2,h3")?.textContent,
        "PlanX",
      ]
        .filter(Boolean)
        .join(" - ");
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

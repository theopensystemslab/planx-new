import { useHtmlDownload } from "./hooks/useHTMLDownload";
import styles from "./ApplicationViewer.module.css";
import { useEffect } from "react";
export const ApplicationViewer = () => {
  const { data: htmlContent, isPending, error, refetch } = useHtmlDownload();

  useEffect(() => {
    if (!htmlContent) return;
    const buttons = document.querySelectorAll<HTMLElement>(".copy-button");
    buttons.forEach((button) => {
      button.addEventListener("click", function () {
        const value = this.getAttribute("data-copy-value");
        const span = this.querySelector("span");
        if (!value || !span) return;
        navigator.clipboard.writeText(value).then(() => {
          span.textContent = "copied";
          setTimeout(() => (span.textContent = "copy"), 1000);
        });
      });
    });
  }, [htmlContent]);

  if (isPending) return <p>Loading application...</p>;

  if (error || !htmlContent) {
    return (
      <div className="styled-content">
        <h2>Failed to load application</h2>
        <p>Error: {error?.message || "Unknown error"}</p>
        <button
          onClick={() => refetch()}
          className="button button--primary button--medium button-focus-style"
        >
          Retry
        </button>
      </div>
    );
  }

  // HTML content already sanitised using DOMPurify on the backend
  return (
    <div
      className={styles["viewer-overrides"]}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

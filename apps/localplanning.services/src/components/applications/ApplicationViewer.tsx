import { useHtmlDownload } from "./hooks/useHTMLDownload";
import styles from "./ApplicationViewer.module.css";

export const ApplicationViewer = () => {
  const { data: htmlContent, isPending, error, refetch } = useHtmlDownload();

  if (isPending) return <p>Loading application...</p>

  if (error || !htmlContent) {
    return (
      <div className="styled-content">
        <h2>Failed to load application</h2>
        <p>Error: {error?.message || "Unknown error"}</p>
        <button onClick={() => refetch()} className="button button--primary button--medium button-focus-style">
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
  )
};

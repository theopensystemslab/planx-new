import { useHtmlDownload } from "./hooks/useHTMLDownload";
import styles from "./ApplicationViewer.module.css";

export const ApplicationViewer = () => {
  const { htmlContent, loading, error, fetchHtml } = useHtmlDownload();

  if (loading) return <p>Loading application...</p>

  if (error) {
    return (
      <div>
        <h2>Failed to load application</h2>
        <p>Error: {error}</p>
        <button onClick={fetchHtml} className="button button--primary button--medium button-focus-style">
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
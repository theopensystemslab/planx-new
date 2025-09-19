import { useHtmlDownload } from "./hooks/useHTMLDownload";

export const ApplicationViewer = () => {
  const applicationId = new URLSearchParams(window.location.search).get("applicationId")
  const { htmlContent, loading, error, fetchHtml } = useHtmlDownload(applicationId);

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
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }}/>
};
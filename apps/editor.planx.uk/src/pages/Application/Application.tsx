import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import { useDownloadApplication } from "../../hooks/useDownloadApplication";

export default function Application() {
  const [sessionId, saveToEmail] = useStore((state) => [
    state.sessionId,
    state.saveToEmail,
  ]);

  const { data: htmlContent, isPending, error } = useDownloadApplication({
    email: saveToEmail,
    sessionId,
  });

  console.log(saveToEmail, sessionId)

  if (isPending) {
    return (
      <p>Loading your application...</p>
    );
  }

  if (error || !htmlContent) {
    return (
      <p>Failed to load application</p>
    );
  }

  return (
    <div className="application-viewer"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
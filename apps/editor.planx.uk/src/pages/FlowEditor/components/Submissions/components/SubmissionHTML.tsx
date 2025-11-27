import Box from "@mui/material/Box";
import { useQuery } from "@tanstack/react-query";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { getSubmissionHTML } from "lib/api/submissions/requests";
import React from "react";
import ErrorSummary from "ui/shared/ErrorSummary/ErrorSummary";

const SubmissionHTML: React.FC<{ sessionId: string }> = ({ sessionId }) => {
  const { data, error, isPending } = useQuery({
    queryKey: ["submission", "html", sessionId],
    queryFn: () => getSubmissionHTML(sessionId),
    enabled: !!sessionId,
  });

  if (isPending) return <DelayedLoadingIndicator />;
  if (error) return <ErrorSummary message="Failed to download HTML" />;

  return <Box dangerouslySetInnerHTML={{ __html: data }} />;
};

export default SubmissionHTML;

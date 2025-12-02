import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { useQuery } from "@tanstack/react-query";
import ApplicationLoadingSkeleton from "components/ApplicationViewerSkeleton";
import { PrintButton } from "components/PrintButton";
import { getSubmissionHTML } from "lib/api/submissions/requests";
import React from "react";

const SubmissionHTML: React.FC<{ sessionId: string }> = ({ sessionId }) => {
  const {
    data: sanitisedHTML,
    error,
    isPending,
  } = useQuery({
    queryKey: ["submission", "html", sessionId],
    queryFn: () => getSubmissionHTML(sessionId),
    enabled: !!sessionId,
  });

  if (error) throw Error(`Unable to download session ${sessionId}`);

  return (
    <Container maxWidth="contentWrap">
      {isPending ? (
        <ApplicationLoadingSkeleton />
      ) : (
        <>
          <Box dangerouslySetInnerHTML={{ __html: sanitisedHTML }} mb={2} />
          <PrintButton />
        </>
      )}
    </Container>
  );
};

export default SubmissionHTML;

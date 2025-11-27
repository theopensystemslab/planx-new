import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import { useQuery } from "@tanstack/react-query";
import { PrintButton } from "components/PrintButton";
import { getSubmissionHTML } from "lib/api/submissions/requests";
import React from "react";

const LoadingSkeleton = () => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <Skeleton variant="text" sx={{ fontSize: "4rem" }} />
    <Skeleton variant="rectangular" width={650} height={650} />
    <Skeleton variant="rectangular" width={1000} height={185} />
    <Skeleton variant="text" width={200} sx={{ fontSize: "2rem" }} />
    <Skeleton variant="rectangular" width={1000} height={185} />
    <Skeleton variant="text" width={200} sx={{ fontSize: "2rem" }} />
    <Skeleton variant="rectangular" width={1000} height={185} />
  </Box>
);

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
        <LoadingSkeleton />
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

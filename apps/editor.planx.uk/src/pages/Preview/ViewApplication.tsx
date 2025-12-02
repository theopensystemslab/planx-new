import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import ApplicationLoadingSkeleton from "components/ApplicationViewerSkeleton";
import { PrintButton } from "components/PrintButton";
import { useDownloadApplication } from "hooks/useDownloadApplication";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

const ApplicationViewer: React.FC = () => {
  // TODO: route guard (s&r)
  // TODO: prefetch token?

  const {
    data: sanitisedHTML,
    error,
    isPending,
  } = useDownloadApplication();

  const sessionId = useStore(state => state.sessionId);

  if (error) throw Error(`Unable to view session ${sessionId}. Error: ${error.message}`);

  const isLoading = isPending || !sanitisedHTML;

  return (
    <Container maxWidth="contentWrap">
      {isLoading ? (
        <ApplicationLoadingSkeleton />
      ) : (
        <Box mb={2}>
          <Box dangerouslySetInnerHTML={{ __html: sanitisedHTML }} mb={2} />
          <PrintButton />
        </Box>
      )}
    </Container>
  );
}

export default ApplicationViewer;
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import SummaryListsBySections from "@planx/components/shared/Preview/SummaryList";
import { PrintButton } from "components/PrintButton";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

const ApplicationViewer: React.FC = () => {
  // TODO: route guard / redirect (s&r)
  const [flow, passport, breadcrumbs] = useStore(state => [state.flow, state.computePassport(), state.breadcrumbs, ]);

  return (
    <Container maxWidth="contentWrap">
      <Box mb={2}>
        {/* TODO: account for empty list */}
        {/* TODO: Add title? */}
        {/* TODO: Back button? */}
        <SummaryListsBySections 
          // TODO: make conditional based on showChangeButton?
          changeAnswer={() => null}
          showChangeButton={false}
          flow={flow}
          passport={passport}
          breadcrumbs={breadcrumbs}
          // TODO(a11y): check this
          sectionComponent="h2"
        />
        <PrintButton/>
      </Box>
    </Container>
  );
}

export default ApplicationViewer;
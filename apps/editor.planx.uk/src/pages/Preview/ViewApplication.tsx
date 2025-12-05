import Typography from "@mui/material/Typography";
import SummaryListsBySections from "@planx/components/shared/Preview/SummaryList";
import { PrintButton } from "components/PrintButton";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import StatusPage from "./StatusPage";

const NoContentPage = () => (
  <StatusPage
    bannerHeading="Your form"
    buttonText="Start a new form"
  >
    <Typography variant="body2">
      No answers to display
    </Typography>
  </StatusPage>
)

const ApplicationViewer: React.FC = () => {
  const [flow, passport, breadcrumbs] = useStore(state => [state.flow, state.computePassport(), state.breadcrumbs]);

  // No answered questions - saving on first question
  const noBreadcrumbs = Object.keys(breadcrumbs).length === 0;
  if (noBreadcrumbs) return <NoContentPage />;

  return (
    <StatusPage bannerHeading="Your form" bannerText="Review your answers">
      <SummaryListsBySections
        changeAnswer={() => null}
        showChangeButton={false}
        flow={flow}
        passport={passport}
        breadcrumbs={breadcrumbs}
        sectionComponent="h2"
      />
      <PrintButton />
    </StatusPage>
  );
}

export default ApplicationViewer;
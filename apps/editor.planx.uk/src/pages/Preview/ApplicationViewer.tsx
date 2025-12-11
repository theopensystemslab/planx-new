import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { FeeBreakdown } from "@planx/components/Pay/Public/FeeBreakdown/FeeBreakdown";
import SummaryListsBySections from "@planx/components/shared/Preview/SummaryList";
import { PrintButton } from "components/PrintButton";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import ApplicationSummary from "ui/public/ApplicationSummary";

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
  const [flow, passport, breadcrumbs, govUkPayment] = useStore(state => [state.flow, state.computePassport(), state.breadcrumbs, state.govUkPayment]);
  const hasPaymentInfo = Boolean(govUkPayment);

  // No answered questions - saving on first question
  const noBreadcrumbs = Object.keys(breadcrumbs).length === 0;
  if (noBreadcrumbs) return <NoContentPage />;

  return (
    <StatusPage bannerHeading="Your form" bannerText="Review your answers">
      <Typography variant="h2">Overview</Typography>
      <ApplicationSummary/>
      <Typography variant="h2">Your responses</Typography>
      <SummaryListsBySections
        changeAnswer={() => null}
        showChangeButton={false}
        flow={flow}
        passport={passport}
        breadcrumbs={breadcrumbs}
        sectionComponent="h2"
      />
      {hasPaymentInfo &&
        <Box mb={4}>
          <Typography variant="h2">Fee breakdown</Typography>
          <FeeBreakdown />
        </Box>
      }
      <PrintButton />
    </StatusPage>
  );
}

export default ApplicationViewer;
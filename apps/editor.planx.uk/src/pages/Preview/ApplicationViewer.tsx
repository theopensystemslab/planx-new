import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { FeeBreakdown } from "@planx/components/Pay/Public/FeeBreakdown/FeeBreakdown";
import SummaryListsBySections from "@planx/components/shared/Preview/SummaryList";
import { useMatches } from "@tanstack/react-router";
import { PrintButton } from "components/PrintButton";
import { useStore } from "pages/FlowEditor/lib/store";
import ApplicationSummary from "ui/public/ApplicationSummary";

import StatusPage from "./StatusPage";

const NoContentPage = () => (
  <StatusPage bannerHeading="Your form" buttonText="Start a new form">
    <Typography variant="body2">No answers to display</Typography>
  </StatusPage>
);

const ApplicationViewer: React.FC = () => {
  const [flow, passport, breadcrumbs, govUkPayment] = useStore((state) => [
    state.flow,
    state.computePassport(),
    state.breadcrumbs,
    state.govUkPayment,
  ]);
  const matches = useMatches();

  const hasPaid = Boolean(govUkPayment);
  // Only reachable from the invite to pay confirmation page
  const isPayViewApplication = Boolean(
    matches.at(-1)?.routeId.endsWith("/pay/view-application"),
  );
  const showFeeBreakdown = hasPaid || isPayViewApplication;

  // No answered questions - saving on first question
  const noBreadcrumbs = Object.keys(breadcrumbs).length === 0;
  if (noBreadcrumbs) return <NoContentPage />;

  const overviewHeadingId = "overview-heading";
  const responsesHeadingId = "your-responses-heading";

  return (
    <StatusPage bannerHeading="Review your responses">
      <Typography variant="h2" id={overviewHeadingId}>
        Overview
      </Typography>
      <ApplicationSummary titleId={overviewHeadingId} />
      <Typography variant="h2" id={responsesHeadingId}>
        Your responses
      </Typography>
      <SummaryListsBySections
        changeAnswer={() => null}
        showChangeButton={false}
        flow={flow}
        passport={passport}
        breadcrumbs={breadcrumbs}
        sectionComponent="h2"
        titleId={responsesHeadingId}
      />
      {showFeeBreakdown && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h2">Fee breakdown</Typography>
          <FeeBreakdown />
        </Box>
      )}
      <PrintButton />
    </StatusPage>
  );
};

export default ApplicationViewer;

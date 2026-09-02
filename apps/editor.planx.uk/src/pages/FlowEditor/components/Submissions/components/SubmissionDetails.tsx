import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { hasFeatureFlag } from "lib/featureFlags";
import type { DescriptionListItem } from "ui/public/DescriptionList";
import { DescriptionList } from "ui/public/DescriptionList";

import { Badge } from "../../../../../components/Badge/Badge";
import { BadgeVariant } from "../../../../../components/Badge/types";
import { useTeamLogo } from "../hooks";
import type { Submission } from "../types";
import { DownloadSubmissionButtonGrouped } from "./DownloadSubmissionButtonGrouped";
import { PaymentMenuGrouped } from "./PaymentMenuGrouped";
import { ViewSubmissionButtonGrouped } from "./ViewSubmissionButtonGrouped";

type SubmissionDetailsProps = {
  sessionId: string;
  latestEvent: Submission;
  teamSlug: string;
  submittedAt?: string;
  isSubmissionAvailable: boolean;
  succeededPayment?: Submission;
};

export const SubmissionDetails: React.FC<SubmissionDetailsProps> = (props) => {
  const submissionData: DescriptionListItem[] = [
    {
      term: "Property address",
      details: props.latestEvent.address || "",
    },
    {
      term: "Reference",
      details: props.sessionId,
    },
    {
      term: "Submitted on",
      details: props.submittedAt
        ? new Date(props?.submittedAt).toLocaleDateString()
        : "",
    },
  ];

  const { data: themeData } = useTeamLogo(props.teamSlug);

  if (!themeData?.teams[0]) {
    return null;
  }

  const teamLogo = themeData?.teams[0].theme.logo;
  const teamName = themeData?.teams[0].name;
  const teamColour = themeData?.teams[0].theme.primaryColour;

  const showSubmissionActions =
    Boolean(props.submittedAt) && props.isSubmissionAvailable;
  const showPaymentActions =
    hasFeatureFlag("STRIPE_MIGRATION") && Boolean(props.succeededPayment);

  return (
    <Box
      sx={{
        background: "background",
        border: 1,
        margin: 1,
        borderColor: "border.main",
      }}
    >
      <Box sx={{ padding: 1, margin: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
          <Badge
            variant={BadgeVariant.Team}
            team={{
              name: teamName,
              theme: { primaryColour: teamColour, logo: teamLogo },
            }}
            size="compact"
          />

          <Typography sx={{ fontWeight: "bold" }}>{teamName}</Typography>
        </Box>

        <Typography variant="h3" sx={{ mb: 2 }}>
          {props.latestEvent?.flowName}
        </Typography>
        <DescriptionList data={submissionData} />
      </Box>

      {(showSubmissionActions || showPaymentActions) && (
        <Box
          sx={{
            display: "flex",
            width: "100%",
            backgroundColor: "background.paper",
            padding: 1,
            gap: 2,
            borderTop: 1,
            borderColor: "border.main",
          }}
        >
          {showSubmissionActions && props.submittedAt && (
            <>
              <ViewSubmissionButtonGrouped
                sessionId={props.sessionId}
                submittedAt={props.submittedAt}
              />
              <DownloadSubmissionButtonGrouped
                sessionId={props.sessionId}
                submittedAt={props.submittedAt}
              />
            </>
          )}
          {showPaymentActions && props.succeededPayment && (
            <PaymentMenuGrouped
              sessionId={props.sessionId}
              paymentEvent={props.succeededPayment}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

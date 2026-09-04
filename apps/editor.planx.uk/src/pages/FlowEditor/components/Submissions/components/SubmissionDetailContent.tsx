import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { addDays, isBefore } from "date-fns";
import { DAYS_UNTIL_EXPIRY } from "lib/pay";
import { useStore } from "pages/FlowEditor/lib/store";

import { useGetSubmissionEvents } from "../hooks";
import type { Submission } from "../types";
import { getSucceededPayment, hasBeenSanitised } from "../utils";
import { SubmissionDetails } from "./SubmissionDetails";
import { SubmissionEventsHistory } from "./SubmissionEventsHistory";

interface SubmissionDetailContentProps {
  sessionId: string;
}

const getSubmittedAt = (events: Submission[]): string | undefined => {
  const successfulSend = events.find(
    (event) =>
      event.eventType !== "Pay" &&
      event.eventType !== "Started session" &&
      event.eventType !== "Invited to pay" &&
      event.status === "Success",
  );

  return successfulSend?.createdAt ?? undefined;
};

const SubmissionDetailContent: React.FC<SubmissionDetailContentProps> = ({
  sessionId,
}) => {
  const [teamSlug] = useStore((state) => [state.teamSlug]);

  const { data, loading, error } = useGetSubmissionEvents(sessionId);

  if (loading) return <DelayedLoadingIndicator />;
  if (error) throw error;

  const events = data?.submissions || [];
  const latestEvent = events[0];
  const submittedAt = getSubmittedAt(events);
  const isSanitised = submittedAt
    ? hasBeenSanitised(new Date(submittedAt))
    : false;
  const succeededPayment = getSucceededPayment(events);

  const submissionExpirationDate = submittedAt
    ? addDays(new Date(submittedAt), DAYS_UNTIL_EXPIRY)
    : null;

  const isSubmissionAvailable = submissionExpirationDate
    ? isBefore(new Date(), submissionExpirationDate)
    : false;

  return (
    <DialogContent>
      <Grid container>
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{
            position: { md: "sticky" },
            top: 0,
            alignSelf: "flex-start",
          }}
        >
          <SubmissionDetails
            sessionId={sessionId}
            latestEvent={latestEvent}
            teamSlug={teamSlug}
            submittedAt={submittedAt}
            isSubmissionAvailable={isSubmissionAvailable}
            isSanitised={isSanitised}
            succeededPayment={succeededPayment}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SubmissionEventsHistory
            events={events}
            isSubmissionAvailable={isSubmissionAvailable}
          />
        </Grid>
      </Grid>
    </DialogContent>
  );
};

export default SubmissionDetailContent;

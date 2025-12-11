import ErrorOutline from "@mui/icons-material/ErrorOutline";
import Typography from "@mui/material/Typography";
import { useMutation } from "@tanstack/react-query";
import { logger } from "airbrake";
import Bowser from "bowser";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { createSendEvents } from "lib/api/send/requests";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";

import Card from "../shared/Preview/Card";
import { ErrorSummaryContainer } from "../shared/Preview/ErrorSummaryContainer";
import { WarningContainer } from "../shared/Preview/WarningContainer";
import { PublicProps } from "../shared/types";
import { DEFAULT_DESTINATION, getCombinedEventsPayload, Send } from "./model";

export type Props = PublicProps<Send>;

const SendComponent: React.FC<Props> = ({
  destinations = [DEFAULT_DESTINATION],
  ...props
}) => {
  const teamSlug = useStore().teamSlug;
  const fullProps = { destinations: destinations, ...props };
  if (
    window.location.pathname.endsWith("/draft") ||
    window.location.pathname.endsWith("/preview")
  ) {
    return <SkipSendWarning {...fullProps} />;
  } else if (teamSlug === "demo") {
    return <DemoTeamWarning {...fullProps} />;
  } else {
    return <CreateSendEvents {...fullProps} />;
  }
};

/**
 * Skip queuing up Send events on non-Save&Return layout routes because they don't record lowcal_session data
 */
const SkipSendWarning: React.FC<Props> = (props) => (
  <Card handleSubmit={props.handleSubmit}>
    <WarningContainer>
      <ErrorOutline />
      <Typography variant="body1" ml={2}>
        You can only test submissions on published routes where Save & Return is
        enabled. Select <strong>Continue</strong> to finish reviewing content
        and skip submission.
      </Typography>
    </WarningContainer>
  </Card>
);

const DemoTeamWarning: React.FC<Props> = (props) => (
  <Card handleSubmit={props.handleSubmit}>
    <ErrorSummaryContainer role="status">
      <Typography variant="h4" ml={2} mb={1}>
        Send is not enabled for services created in the Demo team
      </Typography>
      <Typography variant="body2" ml={2}>
        Click continue to skip send and proceed with testing.
      </Typography>
    </ErrorSummaryContainer>
  </Card>
);

const CreateSendEvents: React.FC<Props> = ({
  destinations = [DEFAULT_DESTINATION],
  ...props
}) => {
  const [sessionId, teamSlug] = useStore((state) => [
    state.sessionId,
    state.teamSlug,
  ]);

  const {
    mutate,
    isPending,
    isSuccess,
    error,
    data: sendResponse,
  } = useMutation({
    mutationFn: createSendEvents,
  });

  useEffect(() => {
    const payload = getCombinedEventsPayload({
      destinations,
      sessionId,
      teamSlug,
    });
    mutate({ sessionId, ...payload });
  }, [mutate, sessionId, destinations, teamSlug]);

  /**
   * Construct breadcrumb containing IDs of each send event generated
   */
  const handleSubmit = () => {
    let data = {};

    if (sendResponse) {
      data = Object.fromEntries(
        destinations.map((destination) => [
          `${destination}SendEventId`,
          sendResponse[destination]?.event_id,
        ]),
      );
    }

    const userAgent = Bowser.parse(window.navigator.userAgent); // This is a weird workaround so that we can include platform in `allow_list_answers` in order to pull it through easily in the `submission_services_summary` table
    const referrer = document.referrer || null;
    props.handleSubmit &&
      props.handleSubmit({
        data: {
          ...data,
          "send.analytics.userAgent": userAgent,
          "send.analytics.referrer": referrer,
          // In case of error, log to breadcrumbs in addition to throwing Airbrake error for debugging purposes
          ...(error && {
            "send.error": `Failed to create send events. Error: ${error.message}`,
          }),
        },
      });
  };

  // Throw errors so that they're caught by our error boundaries and Airbrake
  // User will not be blocked, and will proceed to next node (Confirmation)
  if (error) {
    logger.notify(
      `Failed to create send events for session ${sessionId}. Error: ${error.message}`,
    );
    handleSubmit();
  }

  if (isPending) {
    return (
      <Card>
        <DelayedLoadingIndicator text={"Sending your form..."} />
      </Card>
    );
  }

  // Proceed to next component (Confirmation)
  if (isSuccess) handleSubmit();

  return (
    <Card>
      <DelayedLoadingIndicator text="Finalising your submission..." />
    </Card>
  );
};

export default SendComponent;

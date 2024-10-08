import ErrorOutline from "@mui/icons-material/ErrorOutline";
import Typography from "@mui/material/Typography";
import axios from "axios";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";
import { useAsync } from "react-use";

import Card from "../shared/Preview/Card";
import { WarningContainer } from "../shared/Preview/WarningContainer";
import { makeData } from "../shared/utils";
import { PublicProps } from "../ui";
import {
  DEFAULT_DESTINATION,
  Destination,
  getCombinedEventsPayload,
  Send,
} from "./model";

export type Props = PublicProps<Send>;

const SendComponent: React.FC<Props> = ({
  destinations = [DEFAULT_DESTINATION],
  ...props
}) => {
  const fullProps = { destinations: destinations, ...props };
  if (
    window.location.pathname.endsWith("/draft") ||
    window.location.pathname.endsWith("/preview")
  ) {
    return <SkipSendWarning {...fullProps} />;
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
        You can only test submissions on <strong>published routes</strong> where
        Save & Return is enabled. Click "Continue" to finish reviewing content
        and skip submission.
      </Typography>
    </WarningContainer>
  </Card>
);

const CreateSendEvents: React.FC<Props> = ({
  destinations = [DEFAULT_DESTINATION],
  ...props
}) => {
  const [passport, sessionId, teamSlug] = useStore((state) => [
    state.computePassport(),
    state.sessionId,
    state.teamSlug,
  ]);

  // Send makes a single request to create scheduled events in Hasura, then those events make the actual submission requests with retries etc
  const url = `${
    import.meta.env.VITE_APP_API_URL
  }/create-send-events/${sessionId}`;
  const request: any = useAsync(async () => {
    const combinedEventsPayload = getCombinedEventsPayload({
      destinations,
      teamSlug,
      passport,
      sessionId,
    });

    return axios.post(url, combinedEventsPayload);
  });

  useEffect(() => {
    const isReady = !request.loading && !request.error && request.value;

    if (
      destinations.includes(Destination.BOPS) &&
      isReady &&
      props.handleSubmit
    ) {
      props.handleSubmit(
        makeData(props, request.value.bops?.event_id, "bopsSendEventId"),
      );
    }

    if (
      destinations.includes(Destination.Uniform) &&
      isReady &&
      props.handleSubmit
    ) {
      props.handleSubmit(
        makeData(props, request.value.uniform?.event_id, "uniformSendEventId"),
      );
    }

    if (
      destinations.includes(Destination.Idox) &&
      isReady &&
      props.handleSubmit
    ) {
      props.handleSubmit(
        makeData(props, request.value.idox?.event_id, "idoxSendEventId"),
      );
    }

    if (
      destinations.includes(Destination.Email) &&
      isReady &&
      props.handleSubmit
    ) {
      props.handleSubmit(
        makeData(props, request.value.email?.event_id, "emailSendEventId"),
      );
    }

    if (
      destinations.includes(Destination.S3) &&
      isReady &&
      props.handleSubmit
    ) {
      props.handleSubmit(
        makeData(props, request.value.s3?.event_id, "s3SendEventId"),
      );
    }
  }, [request.loading, request.error, request.value, destinations, props]);

  if (request.loading) {
    return (
      <Card>
        <DelayedLoadingIndicator text={`Submitting your application...`} />
      </Card>
    );
  } else if (request.error) {
    // Throw errors so that they're caught by our error boundaries and Airbrake
    throw request.error;
  } else {
    return (
      <Card>
        <DelayedLoadingIndicator text="Finalising your submission..." />
      </Card>
    );
  }
};

export default SendComponent;

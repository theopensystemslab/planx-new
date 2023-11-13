import axios from "axios";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { hasFeatureFlag } from "lib/featureFlags";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";
import { useAsync } from "react-use";

import Card from "../shared/Preview/Card";
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
  // If testing with the feature flag, skip scheduled event creation because no stored lowcal_session to generate payloads
  const testSession = hasFeatureFlag("DISABLE_SAVE_AND_RETURN");

  useEffect(() => {
    if (testSession) {
      props.handleSubmit?.({
        ...makeData(props, true, "skippedEvents"),
        auto: true,
      });
    }
  }, []);

  if (testSession) {
    return (
      <Card>
        <DelayedLoadingIndicator text={`Skipping test submission...`} />
      </Card>
    );
  } else {
    return <SendEvents destinations={destinations} {...props} />;
  }
};

const SendEvents: React.FC<Props> = ({
  destinations = [DEFAULT_DESTINATION],
  ...props
}) => {
  const [passport, sessionId, teamSlug] = useStore((state) => [
    state.computePassport(),
    state.sessionId,
    state.teamSlug,
  ]);

  // Send makes a single request to create scheduled events in Hasura, then those events make the actual submission requests with retries etc
  const url = `${process.env.REACT_APP_API_URL}/create-send-events/${sessionId}`;
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
      destinations.includes(Destination.Email) &&
      isReady &&
      props.handleSubmit
    ) {
      props.handleSubmit(
        makeData(props, request.value.email?.event_id, "emailSendEventId"),
      );
    }
  }, [request.loading, request.error, request.value]);

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

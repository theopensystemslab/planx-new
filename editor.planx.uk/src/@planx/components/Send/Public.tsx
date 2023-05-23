import makeStyles from "@mui/styles/makeStyles";
import axios from "axios";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";
import { useAsync } from "react-use";

import Card from "../shared/Preview/Card";
import { makeData, useStagingUrlIfTestApplication } from "../shared/utils";
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
  const [
    breadcrumbs,
    flow,
    passport,
    flowId,
    sessionId,
    email,
    flowName,
    teamSlug,
  ] = useStore((state) => [
    state.breadcrumbs,
    state.flow,
    state.computePassport(),
    state.id,
    state.sessionId,
    state.saveToEmail,
    state.flowName,
    state.teamSlug,
  ]);

  // Send makes a single request to create scheduled events in Hasura, then those events make the actual submission requests with retries etc
  const url = `${process.env.REACT_APP_API_URL}/create-send-events/${sessionId}`;
  const request: any = useAsync(async () => {
    const combinedEventsPayload = getCombinedEventsPayload({
      destinations,
      teamSlug,
      breadcrumbs,
      flow,
      flowName,
      passport,
      sessionId,
      email,
    });

    return axios.post(
      useStagingUrlIfTestApplication(passport)(url),
      combinedEventsPayload
    );
  });

  useEffect(() => {
    const isReady = !request.loading && !request.error && request.value;

    if (
      destinations.includes(Destination.BOPS) &&
      isReady &&
      props.handleSubmit
    ) {
      props.handleSubmit(
        makeData(props, request.value.bops?.event_id, "bopsSendEventId")
      );
    }

    if (
      destinations.includes(Destination.Uniform) &&
      isReady &&
      props.handleSubmit
    ) {
      props.handleSubmit(
        makeData(props, request.value.uniform?.event_id, "uniformSendEventId")
      );
    }

    if (
      destinations.includes(Destination.Email) &&
      isReady &&
      props.handleSubmit
    ) {
      props.handleSubmit(
        makeData(props, request.value.email?.event_id, "emailSendEventId")
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

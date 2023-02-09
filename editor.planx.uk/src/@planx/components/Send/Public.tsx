import makeStyles from "@mui/styles/makeStyles";
import axios from "axios";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";
import { useCurrentRoute } from "react-navi";
import { useAsync } from "react-use";

import { publicClient } from "../../../client";
import { useTeamSlug } from "../shared/hooks";
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

const useStyles = makeStyles((theme) => ({
  root: {
    "& *": {
      fontFamily: "Inter, sans-serif",
    },
  },
  errorSummary: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(3),
    border: `5px solid #E91B0C`,
  },
}));

const SendComponent: React.FC<Props> = ({
  destinations = [DEFAULT_DESTINATION],
  ...props
}) => {
  const [breadcrumbs, flow, passport, flowId, sessionId, email] = useStore(
    (state) => [
      state.breadcrumbs,
      state.flow,
      state.computePassport(),
      state.id,
      state.sessionId,
      state.saveToEmail,
    ]
  );
  let teamSlug = useTeamSlug();
  const route = useCurrentRoute();
  const flowName = route?.data?.flowName;

  // Send makes a single request to create scheduled events in Hasura, then those events make the actual submission requests with retries etc
  const url = `${process.env.REACT_APP_API_URL}/create-send-events/${sessionId}`;
  const request: any = useAsync(async () => {
    // fetch template names for the Uniform XML
    const templateNames = await publicClient.getDocumentTemplateNames(flowId);

    const combinedEventsPayload = getCombinedEventsPayload({
      destinations,
      route,
      teamSlug,
      breadcrumbs,
      flow,
      flowName,
      passport,
      sessionId,
      email,
      templateNames,
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

import makeStyles from "@mui/styles/makeStyles";
import axios from "axios";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";
import { useCurrentRoute } from "react-navi";
import { useAsync } from "react-use";

import { useTeamSlug } from "../shared/hooks";
import Card from "../shared/Preview/Card";
import { makeData, useStagingUrlIfTestApplication } from "../shared/utils";
import { PublicProps } from "../ui";
import { getBOPSParams } from "./bops";
import { DEFAULT_DESTINATION, Destination, Send } from "./model";
import { getUniformParams, makeCsvData } from "./uniform";

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
  const [breadcrumbs, flow, passport, sessionId, email] = useStore((state) => [
    state.breadcrumbs,
    state.flow,
    state.computePassport(),
    state.sessionId,
    state.saveToEmail,
  ]);

  let teamSlug = useTeamSlug();
  let combinedEventsPayload: any = {};

  // Format application user data as required by BOPS
  if (destinations.includes(Destination.BOPS)) {
    combinedEventsPayload[Destination.BOPS] = {
      localAuthority: teamSlug,
      body: getBOPSParams(breadcrumbs, flow, passport, sessionId),
    };
  }

  // Format application user data as required by Idox/Uniform
  if (destinations.includes(Destination.Uniform)) {
    // Bucks has 3 instances of Uniform for 4 legacy councils, set teamSlug to pre-merger council name
    if (teamSlug === "buckinghamshire") {
      teamSlug = passport.data?.["property.localAuthorityDistrict"]
        ?.filter((name: string) => name !== "Buckinghamshire")[0]
        ?.toLowerCase()
        ?.replace(/\W+/g, "-");

      // South Bucks & Chiltern share an Idox connector, route addresses in either to Chiltern
      if (teamSlug === "south-bucks") {
        teamSlug = "chiltern";
      }
    }

    combinedEventsPayload[Destination.Uniform] = {
      localAuthority: teamSlug,
      body: getUniformParams(breadcrumbs, flow, passport, sessionId),
    };
  }

  // Format application user data for email
  const route = useCurrentRoute();

  if (destinations.includes(Destination.Email)) {
    combinedEventsPayload[Destination.Email] = {
      localAuthority: teamSlug,
      body: {
        sessionId: sessionId,
        email: email,
        csv: makeCsvData(breadcrumbs, flow, passport, sessionId),
        flowName: route?.data?.flowName,
      },
    };
  }

  // Send makes a single request to create scheduled events in Hasura, then those events make the actual submission requests with retries etc
  const url = `${process.env.REACT_APP_API_URL}/create-send-events/${sessionId}`;
  const request: any = useAsync(async () =>
    axios.post(
      useStagingUrlIfTestApplication(passport)(url),
      combinedEventsPayload
    )
  );

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

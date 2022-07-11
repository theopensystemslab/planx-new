import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import axios from "axios";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";
import { useAsync } from "react-use";

import { useTeamSlug } from "../shared/hooks";
import Card from "../shared/Preview/Card";
import { makeData, useStagingUrlIfTestApplication } from "../shared/utils";
import { PublicProps } from "../ui";
import { getParams } from "./bops";
import { Destination, Send } from "./model";
import { getUniformParams } from "./uniform";

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

const SendComponent: React.FC<Props> = (props) => {
  const [breadcrumbs, flow, passport, sessionId] = useStore((state) => [
    state.breadcrumbs,
    state.flow,
    state.computePassport(),
    state.sessionId,
  ]);
  const classes = useStyles();

  let teamSlug = useTeamSlug();
  // Bucks has 4 legacy instances of Uniform, set teamSlug to pre-merger council name
  if (
    props.destination === Destination.Uniform &&
    teamSlug === "buckinghamshire"
  ) {
    teamSlug = passport.data?.["property.localAuthorityDistrict"]
      ?.filter((name: string) => name !== "Buckinghamshire")[0]
      ?.toLowerCase()
      ?.replace(" ", "-");
  }

  const destinationUrl = `${process.env.REACT_APP_API_URL}/${props.destination}/${teamSlug}`;

  const request: any = useAsync(async () =>
    axios.post(
      useStagingUrlIfTestApplication(passport)(destinationUrl),
      props.destination === Destination.BOPS
        ? getParams(breadcrumbs, flow, passport, sessionId)
        : getUniformParams(breadcrumbs, flow, passport, sessionId)
    )
  );

  useEffect(() => {
    const isReady = !request.loading && !request.error && request.value;

    if (
      props.destination === Destination.BOPS &&
      isReady &&
      props.handleSubmit
    ) {
      props.handleSubmit(
        makeData(props, request.value.data.application.id, "bopsId")
      );
    }

    if (
      props.destination === Destination.Uniform &&
      isReady &&
      props.handleSubmit
    ) {
      props.handleSubmit(
        makeData(
          props,
          request.value.data.application.idox_submission_id,
          "idoxSubmissionId"
        )
      );
    }
  }, [request.loading, request.error, request.value]);

  if (request.loading) {
    return (
      <Card>
        <DelayedLoadingIndicator
          text={`Submitting your application to ${props.destination?.toUpperCase()} ${teamSlug?.toUpperCase()}...`}
          msDelayBeforeVisible={0}
        />
      </Card>
    );
  } else if (
    request.error &&
    request.error.response?.data?.error?.endsWith("local authority")
  ) {
    // Display an error message if this local authority/team isn't configured for the selected destination
    return (
      <Card>
        <div className={classes.errorSummary} role="status">
          <Typography variant="h5" component="h3" gutterBottom>
            Cannot submit your application
          </Typography>
          <Typography variant="body2">
            {request.error.response.data.error}.
          </Typography>
        </div>
      </Card>
    );
  } else if (request.error) {
    // Throw all other errors so that they're caught by our error boundaries and our error logging tool
    throw request.error;
  } else {
    return (
      <Card>
        <DelayedLoadingIndicator
          text="Finalising your submission..."
          msDelayBeforeVisible={0}
        />
      </Card>
    );
  }
};

export default SendComponent;

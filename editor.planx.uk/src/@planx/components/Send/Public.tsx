import axios from "axios";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";
import { useAsync } from "react-use";

import { useTeamSlug } from "../shared/hooks";
import Card from "../shared/Preview/Card";
import { makeData, useStagingUrlIfTestApplication } from "../shared/utils";
import { PublicProps } from "../ui";
import { getParams } from "./bops";
import { Send } from "./model";

export type Props = PublicProps<Send>;

const SendComponent: React.FC<Props> = (props) => {
  const [breadcrumbs, flow, passport, sessionId] = useStore((state) => [
    state.breadcrumbs,
    state.flow,
    state.computePassport(),
    state.sessionId,
  ]);

  let teamSlug = useTeamSlug();
  // Bucks has 4 legacy instances of Uniform, set teamSlug to pre-merger council name
  if (props.destination === "uniform" && teamSlug === "buckinghamshire") {
    teamSlug = passport.data?.["property.localAuthorityDistrict"]
      ?.filter((name: string) => name !== "Buckinghamshire")[0]
      ?.toLowerCase()
      .replace(" ", "-");
  }

  const destinationUrl = `${process.env.REACT_APP_API_URL}/${props.destination}/${teamSlug}`;

  const request = useAsync(async () =>
    axios.post(
      useStagingUrlIfTestApplication(passport)(destinationUrl),
      getParams(breadcrumbs, flow, passport, sessionId)
    )
  );

  useEffect(() => {
    if (
      props.destination === "bops" &&
      !request.loading &&
      !request.error &&
      request.value &&
      props.handleSubmit
    ) {
      props.handleSubmit(
        makeData(props, request.value.data.application.id, "bopsId")
      );
    }
  }, [request.loading, request.error, request.value]);

  if (request.loading) {
    return <Card>Sending data to {props.destination.toUpperCase()}…</Card>;
  } else if (request.error) {
    // Throw error so that they're caught by our error boundaries and our error logging tool
    throw request.error;
  } else {
    return <Card>Finalising…</Card>;
  }
};

export default SendComponent;

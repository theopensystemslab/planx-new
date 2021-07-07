import axios from "axios";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";
import { useAsync } from "react-use";

import { useTeamSlug } from "../shared/hooks";
import Card from "../shared/Preview/Card";
import { makeData, useStagingUrlIfTestApplication } from "../shared/utils";
import { PublicProps } from "../ui";
import { getParams } from "./bops";
import { BOPS_URL, Send } from "./model";

export type Props = PublicProps<Send>;

const SendComponent: React.FC<Props> = (props) => {
  const [breadcrumbs, flow, passport, sessionId] = useStore((state) => [
    state.breadcrumbs,
    state.flow,
    state.computePassport(),
    state.sessionId,
  ]);

  const teamSlug = useTeamSlug();

  const request = useAsync(async () =>
    axios.post(
      useStagingUrlIfTestApplication(passport)(`${BOPS_URL}/${teamSlug}`),
      getParams(breadcrumbs, flow, passport, sessionId)
    )
  );

  useEffect(() => {
    if (
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
    return <Card>Sending data…</Card>;
  } else if (request.error) {
    // Throw error so that they're caught by our error boundaries and our error logging tool
    throw request.error;
  } else {
    return <Card>Finalising…</Card>;
  }
};

export default SendComponent;

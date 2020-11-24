import { MoreInformation } from "@planx/components/shared";
import { useStore } from "pages/FlowEditor/lib/store";
import type { handleSubmit } from "pages/Preview/Node";
import React, { Suspense } from "react";

import Presentational from "./Presentational";

export default Component;

interface Props extends MoreInformation {
  handleSubmit: handleSubmit;
}

function Component(props: Props) {
  const [breadcrumbs, flow, passport] = useStore((state) => [
    state.breadcrumbs,
    state.flow,
    state.passport,
  ]);
  return (
    <Presentational
      breadcrumbs={breadcrumbs}
      flow={flow}
      passport={passport}
      handleSubmit={props.handleSubmit}
    />
  );
}

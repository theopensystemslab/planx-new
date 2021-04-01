import { MoreInformation } from "@planx/components/shared";
import type { Store } from "pages/FlowEditor/lib/store";
import { useStore } from "pages/FlowEditor/lib/store";
import type { handleSubmit } from "pages/Preview/Node";
import React from "react";

import Presentational from "./Presentational";

export default Component;

interface Props extends MoreInformation {
  handleSubmit: handleSubmit;
}

function Component(props: Props) {
  const [breadcrumbs, flow, passport, record, hasPaid] = useStore((state) => [
    state.breadcrumbs,
    state.flow,
    state.passport,
    state.record,
    state.hasPaid(),
  ]);
  return (
    <Presentational
      breadcrumbs={breadcrumbs}
      flow={flow}
      passport={passport}
      handleSubmit={props.handleSubmit}
      changeAnswer={changeAnswer}
      showChangeButton={!hasPaid}
    />
  );

  function changeAnswer(id: Store.nodeId) {
    // XXX: Remove the node `id` and all subsequent ones from breadcrumbs
    record(id, undefined);
  }
}

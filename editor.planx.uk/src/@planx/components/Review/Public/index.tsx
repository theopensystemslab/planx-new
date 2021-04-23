import { MoreInformation } from "@planx/components/shared";
import { PublicProps } from "@planx/components/ui";
import type { Store } from "pages/FlowEditor/lib/store";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import Presentational from "./Presentational";

export default Component;

function Component(props: PublicProps<MoreInformation>) {
  const [breadcrumbs, flow, passport, record, hasPaid] = useStore((state) => [
    state.breadcrumbs,
    state.flow,
    state.computePassport(),
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

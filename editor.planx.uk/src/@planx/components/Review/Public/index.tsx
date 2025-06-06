import { PublicProps } from "@planx/components/shared/types";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import type { Review } from "../model";
import { DEFAULT_REVIEW_DISCLAIMER } from "../model";
import Presentational from "./Presentational";

export default Component;

function Component(props: PublicProps<Review>) {
  const [breadcrumbs, flow, passport, hasPaid, changeAnswer] = useStore(
    (state) => [
      state.breadcrumbs,
      state.flow,
      state.computePassport(),
      state.hasPaid(),
      state.changeAnswer,
    ],
  );
  return (
    <Presentational
      title={props.title}
      description={props.description}
      disclaimer={props.disclaimer || DEFAULT_REVIEW_DISCLAIMER}
      breadcrumbs={breadcrumbs}
      flow={flow}
      passport={passport}
      handleSubmit={props.handleSubmit}
      changeAnswer={changeAnswer}
      showChangeButton={!hasPaid}
    />
  );
}

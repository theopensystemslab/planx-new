import { NodeId } from "@opensystemslab/planx-core/types";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import SummaryLists from "@planx/components/shared/Preview/SummaryList";
import { PrintButton } from "components/PrintButton";
import { Store } from "pages/FlowEditor/lib/store";
import { sortBreadcrumbs } from "pages/FlowEditor/lib/store/preview";
import type { HandleSubmit } from "pages/Preview/Node";
import React from "react";

import { Review } from "../model";

export default Component;

interface Props extends Review {
  breadcrumbs: Store.Breadcrumbs;
  flow: Store.Flow;
  passport: Store.Passport;
  handleSubmit?: HandleSubmit;
  changeAnswer: (id: NodeId) => void;
  showChangeButton: boolean;
}

function Component(props: Props) {
  // ensure questions & answers display in expected order
  const sortedBreadcrumbs: Store.Breadcrumbs = sortBreadcrumbs(
    props.breadcrumbs,
    props.flow,
  );

  return (
    <Card isValid handleSubmit={props.handleSubmit}>
      <CardHeader title={props.title} description={props.description} />
      <SummaryLists
        breadcrumbs={sortedBreadcrumbs}
        flow={props.flow}
        passport={props.passport}
        changeAnswer={props.changeAnswer}
        showChangeButton={props.showChangeButton}
        sectionComponent="h2"
        disclaimer={props.disclaimer}
      />
      <PrintButton />
    </Card>
  );
}

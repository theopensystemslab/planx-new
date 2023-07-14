import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import SummaryListsBySections from "@planx/components/shared/Preview/SummaryList";
import { Store } from "pages/FlowEditor/lib/store";
import { sortBreadcrumbs } from "pages/FlowEditor/lib/store/preview";
import type { handleSubmit } from "pages/Preview/Node";
import React from "react";

export default Component;

interface Props {
  title: string;
  description: string;
  breadcrumbs: Store.breadcrumbs;
  flow: Store.flow;
  passport: Store.passport;
  handleSubmit?: handleSubmit;
  changeAnswer: (id: Store.nodeId) => void;
  showChangeButton: boolean;
}

function Component(props: Props) {
  // ensure questions & answers display in expected order
  const sortedBreadcrumbs: Store.breadcrumbs = sortBreadcrumbs(
    props.breadcrumbs,
    props.flow,
  );

  return (
    <Card isValid handleSubmit={props.handleSubmit}>
      <QuestionHeader title={props.title} description={props.description} />
      <SummaryListsBySections
        breadcrumbs={sortedBreadcrumbs}
        flow={props.flow}
        passport={props.passport}
        changeAnswer={props.changeAnswer}
        showChangeButton={props.showChangeButton}
        sectionComponent="h2"
      />
    </Card>
  );
}

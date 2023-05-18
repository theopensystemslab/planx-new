import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import SummaryListsBySections from "@planx/components/shared/Preview/SummaryList";
import { Store } from "pages/FlowEditor/lib/store";
import { sortBreadcrumbs } from "pages/FlowEditor/lib/store/preview";
import type { handleSubmit } from "pages/Preview/Node";
import React from "react";

export default Component;

// TODO: Is this really needed? Why isn't it being picked up from the theme?
const Root = styled(Box)(({ theme }) => ({
  "& *": {
    fontFamily: "Inter, sans-serif",
  },
}));

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
    props.flow
  );

  return (
    <Card isValid handleSubmit={props.handleSubmit}>
      <Root>
        <QuestionHeader title={props.title} description={props.description} />
        <SummaryListsBySections
          breadcrumbs={sortedBreadcrumbs}
          flow={props.flow}
          passport={props.passport}
          changeAnswer={props.changeAnswer}
          showChangeButton={props.showChangeButton}
          sectionComponent="h2"
        />
      </Root>
    </Card>
  );
}

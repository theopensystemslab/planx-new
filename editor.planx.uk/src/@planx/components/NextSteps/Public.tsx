import { PublicProps } from "@planx/components/ui";
import {
  NextStepsLinkMetadata,
  TrackNextStepsLinkClick,
  useAnalyticsTracking,
} from "pages/FlowEditor/lib/analyticsProvider";
import React from "react";
import NextStepsList from "ui/NextStepsList";

import Card from "../shared/Preview/Card";
import QuestionHeader from "../shared/Preview/QuestionHeader";
import { NextSteps } from "./model";

export type Props = PublicProps<NextSteps>;

const NextStepsComponent: React.FC<Props> = (props) => {
  const { trackNextStepsClick } = useAnalyticsTracking();

  const handleNextStepsLinkClick: TrackNextStepsLinkClick = (
    metadata: NextStepsLinkMetadata,
  ) => {
    trackNextStepsClick(metadata); // This returns a promise but we don't need to await for it
  };

  return (
    <Card>
      <QuestionHeader
        title={props.title}
        description={props.description}
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
      <NextStepsList
        steps={props.steps}
        handleSubmit={props.handleSubmit}
        handleNextStepsLinkClick={handleNextStepsLinkClick}
      />
    </Card>
  );
};

export default NextStepsComponent;

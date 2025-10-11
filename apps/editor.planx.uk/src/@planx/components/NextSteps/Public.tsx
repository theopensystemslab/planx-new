import { PublicProps } from "@planx/components/shared/types";
import React from "react";
import NextStepsList from "ui/public/NextStepsList";

import Card from "../shared/Preview/Card";
import { CardHeader } from "../shared/Preview/CardHeader/CardHeader";
import { NextSteps } from "./model";

export type Props = PublicProps<NextSteps>;

const NextStepsComponent: React.FC<Props> = (props) => {
  return (
    <Card>
      <CardHeader
        title={props.title}
        description={props.description}
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
      <NextStepsList steps={props.steps} handleSubmit={props.handleSubmit} />
    </Card>
  );
};

export default NextStepsComponent;

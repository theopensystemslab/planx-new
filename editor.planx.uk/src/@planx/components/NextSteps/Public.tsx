import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { PublicProps } from "@planx/components/ui";
import React from "react";
import NextStepsList from "ui/NextStepsList";

import Card from "../shared/Preview/Card";
import QuestionHeader from "../shared/Preview/QuestionHeader";
import { NextSteps } from "./model";

export type Props = PublicProps<NextSteps>;

const NextStepsComponent: React.FC<Props> = (props) => {
  return (
    <Card>
      <QuestionHeader
        title={props.title}
        description={props.description}
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
      <NextStepsList items={props.steps} heading={"h2"} />
    </Card>
  );
};

export default NextStepsComponent;

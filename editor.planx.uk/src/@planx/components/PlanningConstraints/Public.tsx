import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import type { PublicProps } from "@planx/components/ui";
import React from "react";

import type { PlanningConstraints } from "./model";

type Props = PublicProps<PlanningConstraints>;

export default Component;

function Component(props: Props) {
  return (
    <Card handleSubmit={props.handleSubmit} isValid>
      <QuestionHeader
        title={props.title}
        description={props.description || ""}
      />
    </Card>
  );
}

import { PublicProps } from "@planx/components/ui";
import React from "react";

import Card from "../shared/Preview/Card";
import QuestionHeader from "../shared/Preview/QuestionHeader";
import { TextInputGroup } from "./model";

type Props = PublicProps<TextInputGroup>;

function TextInputGroupComponent(props: Props) {
  return (
    <Card handleSubmit={props.handleSubmit} isValid>
      <QuestionHeader
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
    </Card>
  );
}

export default TextInputGroupComponent;

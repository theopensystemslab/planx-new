import { PublicProps } from "@planx/components/ui";
import { hasFeatureFlag } from "lib/featureFlags";
import React from "react";
import { FeaturePlaceholder } from "ui/editor/FeaturePlaceholder";

import Card from "../shared/Preview/Card";
import QuestionHeader from "../shared/Preview/QuestionHeader";
import { List } from "./model";

type Props = PublicProps<List>;

function ListComponent(props: Props) {
  if (!hasFeatureFlag("LIST_COMPONENT")) return null;

  return (
    <Card handleSubmit={props.handleSubmit} isValid>
      <QuestionHeader
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
      <FeaturePlaceholder title="Under development" />
    </Card>
  );
}

export default ListComponent;

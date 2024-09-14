import { PublicProps } from "@planx/components/ui";
import React from "react";

import Card from "../shared/Preview/Card";
import CardHeader from "../shared/Preview/CardHeader";
import { Page } from "./model";

type Props = PublicProps<Page>;

function PageComponent(props: Props) {
  return (
    <Card handleSubmit={props.handleSubmit} isValid>
      <CardHeader
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
    </Card>
  );
}

export default PageComponent;

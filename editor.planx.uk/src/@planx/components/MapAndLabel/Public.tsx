import React from "react";

import Card from "../shared/Preview/Card";
import CardHeader from "../shared/Preview/CardHeader";
import { PublicProps } from "../ui";
import { MapAndLabel } from "./model";

type Props = PublicProps<MapAndLabel>;

function MapAndLabelComponent(props: Props) {
  return (
    <Card handleSubmit={props.handleSubmit} isValid>
      <CardHeader
        title={props.title}
        description={props.description}
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
    </Card>
  );
}

export default MapAndLabelComponent;

import React from "react";

import Card from "../shared/Preview/Card";
import CardHeader from "../shared/Preview/CardHeader";
import { MapContainer } from "../shared/Preview/MapContainer";
import { PublicProps } from "../ui";
import { MapAndLabel } from "./model";

type Props = PublicProps<MapAndLabel>;

function MapAndLabelComponent(props: Props) {
  console.log({ public: props });
  return (
    <Card handleSubmit={props.handleSubmit} isValid>
      <CardHeader
        title={props.title}
        description={props.description}
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
      <MapContainer environment="standalone">
        <my-map
          drawMode
          drawPointer="crosshair"
          zoom={20}
          drawFillColor={props.lineColour + "35"}
          drawColor={props.lineColour}
          drawPointColor={props.lineColour}
          showCentreMarker
          drawType={props.drawType}
        />
      </MapContainer>
    </Card>
  );
}

export default MapAndLabelComponent;

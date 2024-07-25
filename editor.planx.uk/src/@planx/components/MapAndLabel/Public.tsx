import React from "react";

import Card from "../shared/Preview/Card";
import CardHeader from "../shared/Preview/CardHeader";
import { MapContainer } from "../shared/Preview/MapContainer";
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
      <MapContainer environment="standalone">
        <my-map
          drawMode
          drawPointer="crosshair"
          zoom={20}
          // adding 1A to the hexcode string adds 10% opacity to the colour
          drawFillColor={props.drawColour + "1A"}
          drawColor={props.drawColour}
          drawPointColor={props.drawColour}
          showCentreMarker
          drawType={props.drawType}
        />
      </MapContainer>
    </Card>
  );
}

export default MapAndLabelComponent;

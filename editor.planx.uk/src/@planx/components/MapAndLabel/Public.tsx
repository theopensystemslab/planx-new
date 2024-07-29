import { alpha } from "@mui/material/styles";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import Card from "../shared/Preview/Card";
import CardHeader from "../shared/Preview/CardHeader";
import { MapContainer } from "../shared/Preview/MapContainer";
import { PublicProps } from "../ui";
import { MapAndLabel } from "./model";

type Props = PublicProps<MapAndLabel>;

function MapAndLabelComponent(props: Props) {
  const teamSettings = useStore.getState().teamSettings;
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
          zoom={16}
          drawFillColor={alpha(props.drawColor, 0.1)}
          drawColor={props.drawColor}
          drawPointColor={props.drawColor}
          drawType={props.drawType}
          clipGeojsonData={
            teamSettings?.boundaryBBox &&
            JSON.stringify(teamSettings?.boundaryBBox)
          }
        />
      </MapContainer>
    </Card>
  );
}

export default MapAndLabelComponent;

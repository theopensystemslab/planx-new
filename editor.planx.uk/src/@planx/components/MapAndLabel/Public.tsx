import { alpha } from "@mui/material/styles";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";

import Card from "../shared/Preview/Card";
import CardHeader from "../shared/Preview/CardHeader";
import { MapContainer } from "../shared/Preview/MapContainer";
import { PublicProps } from "../ui";
import { MapAndLabel } from "./model";

type Props = PublicProps<MapAndLabel>;

function MapAndLabelComponent(props: Props) {
  const teamSettings = useStore.getState().teamSettings;

  const defaultBboxJSON = {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [1.9134116, 49.528423],
          [1.9134116, 61.331151],
          [1.9134116, 61.331151],
          [-10.76418, 61.331151],
          [-10.76418, 49.528423],
        ],
      ],
    },
    properties: {},
  };

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
            teamSettings !== undefined
              ? JSON.stringify(teamSettings.boundaryBBox)
              : JSON.stringify(defaultBboxJSON)
          }
        />
      </MapContainer>
    </Card>
  );
}

export default MapAndLabelComponent;

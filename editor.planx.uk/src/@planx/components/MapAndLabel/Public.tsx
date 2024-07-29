import { alpha } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { Feature } from "geojson";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

import Card from "../shared/Preview/Card";
import CardHeader from "../shared/Preview/CardHeader";
import { MapContainer, MapFooter } from "../shared/Preview/MapContainer";
import { PublicProps } from "../ui";
import { MapAndLabel } from "./model";

type Props = PublicProps<MapAndLabel>;

export type Boundary = Feature | undefined;

function MapAndLabelComponent(props: Props) {
  const teamSettings = useStore.getState().teamSettings;
  const [boundary, setBoundary] = useState<Boundary>();
  const [area, setArea] = useState<number | undefined>(0);

  const areaChangeHandler = ({ detail }: { detail: string }) => {
    console.log(detail);
    const numberString = detail.split(" ")[0];
    const area = Number(numberString);
    setArea(area);
  };

  const geojsonChangeHandler = ({ detail: geojson }: any) => {
    console.log(geojson);
    if (geojson["EPSG:3857"]?.features) {
      // only a single polygon can be drawn, so get first feature in geojson "FeatureCollection"
      setBoundary(geojson["EPSG:3857"].features);
    } else {
      // if the user clicks 'reset' to erase the drawing, geojson will be empty object, so set boundary to undefined
      setBoundary(undefined);
    }
  };

  const map: any = document.getElementById("draw-boundary-map");

  map?.addEventListener("areaChange", areaChangeHandler);
  map?.addEventListener("geojsonChange", geojsonChangeHandler);

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
        {/* @ts-ignore */}
        <my-map
          id="draw-boundary-map"
          drawMode
          drawGeojsonData={JSON.stringify(boundary)}
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
        <MapFooter>
          <Typography variant="body1">
            The property boundary you have drawn is{" "}
            <Typography
              component="span"
              noWrap
              sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
            >
              {area?.toLocaleString("en-GB") ?? 0} m²
            </Typography>
          </Typography>
        </MapFooter>
      </MapContainer>
    </Card>
  );
}

export default MapAndLabelComponent;

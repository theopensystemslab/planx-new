import Typography from "@mui/material/Typography";
import { Feature } from "geojson";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import Card from "../shared/Preview/Card";
import CardHeader from "../shared/Preview/CardHeader";
import { MapContainer, MapFooter } from "../shared/Preview/MapContainer";
import { PublicProps } from "../ui";
import { MapAndLabel } from "./model";

type Props = PublicProps<MapAndLabel>;

type Boundary = Feature | undefined;

function MapAndLabelComponent(props: Props) {
  const teamSettings = useStore.getState().teamSettings;
  const [boundary, setBoundary] = useState<Boundary>();
  const [area, setArea] = useState<number | undefined>(0);
  const [objectArray, setObjectArray] = useState<any>([]);
  const [mapValidationError, setMapValidationError] = useState<string>();

  let count = 0;

  useEffect(() => {
    const geojsonChangeHandler = ({ detail: geojson }: any) => {
      if (geojson["EPSG:3857"]?.features) {
        count++;

        // only a single polygon can be drawn, so get first feature in geojson "FeatureCollection"
        setBoundary(geojson["EPSG:3857"].features[0]);
        setObjectArray([
          ...objectArray,
          { number: count, feature: geojson["EPSG:3857"].features[0] },
        ]);
      } else {
        // if the user clicks 'reset' to erase the drawing, geojson will be empty object, so set boundary to undefined
        setBoundary(undefined);
      }
    };

    const map: any = document.getElementById("draw-boundary-map");
    map?.addEventListener("geojsonChange", geojsonChangeHandler);

    return function cleanup() {
      map?.removeEventListener("geojsonChange", geojsonChangeHandler);
    };
  }, [objectArray, boundary]);

  useEffect(() => {
    if (!boundary && objectArray.length < 1) {
      setMapValidationError("Add a boundary to the map");
    }
  }, [boundary]);

  return (
    <Card handleSubmit={props.handleSubmit} isValid={!mapValidationError}>
      <CardHeader
        title={props.title}
        description={props.description}
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
      <ErrorWrapper error={mapValidationError} id="draw-boundary-map">
        <MapContainer environment="standalone">
          {/* @ts-ignore */}
          <my-map
            id="draw-boundary-map"
            zoom={16}
            drawMode
            drawPointer="crosshair"
            drawGeojsonData={JSON.stringify(boundary)}
            drawColor={props.drawColor}
            drawType={props.drawType}
            clipGeojsonData={
              teamSettings?.boundaryBBox &&
              JSON.stringify(teamSettings?.boundaryBBox)
            }
            osProxyEndpoint={`${process.env.REACT_APP_API_URL}/proxy/ordnance-survey`}
            osCopyright={`© Crown copyright and database rights ${new Date().getFullYear()} OS (0)100024857`}
            collapseAttributions={window.innerWidth < 500 ? true : undefined}
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
      </ErrorWrapper>
    </Card>
  );
}

export default MapAndLabelComponent;

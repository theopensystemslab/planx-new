import Typography from "@mui/material/Typography";
import { Feature } from "geojson";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useRef, useState } from "react";
import InputField from "ui/editor/InputField";
import FullWidthWrapper from "ui/public/FullWidthWrapper";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import InputRow from "ui/shared/InputRow";

import { Schema } from "../../List/model";
import { ListCard } from "../../List/Public";
import Card from "../../shared/Preview/Card";
import CardHeader from "../../shared/Preview/CardHeader";
import { MapContainer, MapFooter } from "../../shared/Preview/MapContainer";
import { PublicProps } from "../../ui";
import { MapAndLabel } from "./../model";

type Props = PublicProps<MapAndLabel>;

function MapAndLabelComponent(props: Props) {
  const isMounted = useRef(false);
  const teamSettings = useStore.getState().teamSettings;
  const passport = useStore((state) => state.computePassport());

  console.log("HERE", props.schema);

  const [features, setFeatures] = useState<Feature[] | undefined>(undefined);
  const [mapValidationError, setMapValidationError] = useState<string>();

  useEffect(() => {
    if (isMounted.current) setFeatures([]);
    isMounted.current = true;

    const geojsonChangeHandler = ({ detail: geojson }: any) => {
      if (geojson["EPSG:3857"]?.features) {
        setFeatures(geojson["EPSG:3857"].features);
      } else {
        // if the user clicks 'reset' to erase the drawing, geojson will be empty object, so set features to undefined
        setFeatures(undefined);
      }
    };

    const map: any = document.getElementById("map-and-label-map");

    map?.addEventListener("geojsonChange", geojsonChangeHandler);

    return function cleanup() {
      map?.removeEventListener("geojsonChange", geojsonChangeHandler);
    };
  }, [setFeatures]);

  return (
    <Card handleSubmit={props.handleSubmit} isValid={true}>
      <CardHeader
        title={props.title}
        description={props.description}
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
      <FullWidthWrapper>
        <ErrorWrapper
          error={mapValidationError}
          id="map-and-label-map-error-wrapper"
        >
          <MapContainer environment="standalone">
            {/* @ts-ignore */}
            <my-map
              id="map-and-label-map"
              ariaLabelOlFixedOverlay="An interactive map for plotting and describing individual features"
              drawMode
              drawMany
              drawColor={props.drawColor}
              drawType={props.drawType}
              drawPointer="crosshair"
              drawGeojsonData={JSON.stringify(features)}
              zoom={20}
              maxZoom={23}
              latitude={Number(passport?.data?._address?.latitude)}
              longitude={Number(passport?.data?._address?.longitude)}
              resetControlImage="trash"
              osProxyEndpoint={`${process.env.REACT_APP_API_URL}/proxy/ordnance-survey`}
              osCopyright={`Basemap subject to Crown copyright and database rights ${new Date().getFullYear()} OS (0)100024857`}
              clipGeojsonData={
                teamSettings?.boundaryBBox &&
                JSON.stringify(teamSettings?.boundaryBBox)
              }
            />
          </MapContainer>
        </ErrorWrapper>
        <MapFooter>
          <Typography variant="body1">
            {`You've plotted ${
              features?.length || 0
            } ${props.schemaName.toLocaleLowerCase()}`}
          </Typography>
        </MapFooter>
      </FullWidthWrapper>
      {features &&
        features?.length > 0 &&
        features.map((feature, i) => (
          <ActiveFeatureCard
            key={`feature-card-${parseInt(feature.properties?.label) || i}`}
            index={parseInt(feature.properties?.label) || i}
            schema={props.schema}
          />
        ))}
    </Card>
  );
}

const ActiveFeatureCard: React.FC<{
  index: number;
  schema: Schema;
}> = ({ index: i, schema }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <ListCard data-testid={`list-card-${i}`} ref={ref}>
      <Typography component="h2" variant="h3">
        {`${schema.type} ${i}`}
      </Typography>
      {schema.fields.map((field, i) => (
        <InputRow key={i}>
          <InputField {...field} />
        </InputRow>
      ))}
    </ListCard>
  );
};

export default MapAndLabelComponent;

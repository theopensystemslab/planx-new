import Typography from "@mui/material/Typography";
import { Field } from "@planx/components/List/model";
import { Feature } from "geojson";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useRef, useState } from "react";
import FullWidthWrapper from "ui/public/FullWidthWrapper";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import InputRow from "ui/shared/InputRow";

import { ListCard } from "../../List/Public";
import Card from "../../shared/Preview/Card";
import CardHeader from "../../shared/Preview/CardHeader";
import { MapContainer, MapFooter } from "../../shared/Preview/MapContainer";
import { PublicProps } from "../../ui";
import { MapAndLabel } from "./../model";
import { MapAndLabelProvider, useMapAndLabelContext } from "./Context";
import {
  ChecklistFieldInput,
  NumberFieldInput,
  RadioFieldInput,
  SelectFieldInput,
  TextFieldInput,
} from "./Fields";

type Props = PublicProps<MapAndLabel>;

/**
 * Controller to return correct user input for field in schema
 */
export const InputField: React.FC<Field> = (props) => {
  const inputFieldId = `input-${props.type}-${props.data.fn}`;

  switch (props.type) {
    case "text":
      return <TextFieldInput id={inputFieldId} {...props} />;
    case "number":
      return <NumberFieldInput id={inputFieldId} {...props} />;
    case "question":
      if (props.data.options.length === 2) {
        return <RadioFieldInput id={inputFieldId} {...props} />;
      }
      return <SelectFieldInput id={inputFieldId} {...props} />;
    case "checklist":
      return <ChecklistFieldInput id={inputFieldId} {...props} />;
  }
};

const ActiveFeatureCard: React.FC<{
  index: number;
  feature: Feature;
}> = ({ index: i, feature }) => {
  const { schema } = useMapAndLabelContext();

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
      <Typography variant="body2">
        {`${feature.geometry.type}`}
        {feature.geometry.type === "Point"
          ? ` (${feature.geometry.coordinates.map((coord) =>
              coord.toFixed(5),
            )})`
          : ` (area ${feature.properties?.area || `0 m²`})`}
      </Typography>
      {schema.fields.map((field, i) => (
        <InputRow key={i}>
          <InputField {...field} />
        </InputRow>
      ))}
    </ListCard>
  );
};

const Root = () => {
  const { validateAndSubmitForm, mapAndLabelProps } = useMapAndLabelContext();
  const {
    title,
    description,
    info,
    policyRef,
    howMeasured,
    drawColor,
    drawType,
    schemaName,
  } = mapAndLabelProps;

  const teamSettings = useStore.getState().teamSettings;
  const passport = useStore((state) => state.computePassport());

  const [features, setFeatures] = useState<Feature[] | undefined>(undefined);
  const [mapValidationError, setMapValidationError] = useState<string>();

  useEffect(() => {
    const geojsonChangeHandler = ({ detail: geojson }: any) => {
      if (geojson["EPSG:3857"]?.features) {
        setFeatures(geojson["EPSG:3857"].features);
      } else {
        // if the user clicks 'reset' on the map, geojson will be empty object, so set features to undefined
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
    <Card handleSubmit={validateAndSubmitForm} isValid>
      <CardHeader
        title={title}
        description={description}
        info={info}
        policyRef={policyRef}
        howMeasured={howMeasured}
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
              ariaLabelOlFixedOverlay={`An interactive map for plotting and describing individual ${schemaName.toLocaleLowerCase()}`}
              drawMode
              drawMany
              drawColor={drawColor}
              drawType={drawType}
              drawPointer="crosshair"
              zoom={20}
              maxZoom={23}
              latitude={Number(passport?.data?._address?.latitude)}
              longitude={Number(passport?.data?._address?.longitude)}
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
            } ${schemaName.toLocaleLowerCase()}`}
          </Typography>
        </MapFooter>
      </FullWidthWrapper>
      {features &&
        features?.length > 0 &&
        features.map((feature, i) => (
          <ActiveFeatureCard
            key={`feature-card-${parseInt(feature.properties?.label) || i}`}
            index={parseInt(feature.properties?.label) || i}
            feature={feature}
          />
        ))}
    </Card>
  );
};

function MapAndLabelComponent(props: Props) {
  return (
    <MapAndLabelProvider {...props}>
      <Root />
    </MapAndLabelProvider>
  );
}

export default MapAndLabelComponent;

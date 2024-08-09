import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { Field } from "@planx/components/List/model";
import { formatSchemaDisplayValue } from "@planx/components/List/utils";
import { Feature } from "geojson";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useRef, useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import InputLabel from "ui/public/InputLabel";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import InputRow from "ui/shared/InputRow";

import { CardButton, ListCard } from "../../List/Public";
import Card from "../../shared/Preview/Card";
import CardHeader from "../../shared/Preview/CardHeader";
import { MapContainer } from "../../shared/Preview/MapContainer";
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
}> = ({ index: i }) => {
  const { schema, mapAndLabelProps, saveItem, cancelEditItem } =
    useMapAndLabelContext();
  const { drawColor, drawType, schemaName } = mapAndLabelProps;

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

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <ListCard data-testid={`list-card-${i}`} ref={ref}>
      <Typography component="h2" variant="h3">
        {`${schema.type} ${i + 1}`}
      </Typography>
      {/* <Typography variant="body2">
        {`${feature.geometry.type}`}
        {feature.geometry.type === "Point"
          ? ` (${feature.geometry.coordinates.map((coord) =>
              coord.toFixed(5),
            )})`
          : ` (area ${feature.properties?.area || `0 m²`})`}
      </Typography> */}
      {schema.fields.map((field, i) => (
        <InputRow key={i}>
          <InputField {...field} />
        </InputRow>
      ))}
      <InputLabel
        id="map-and-label-map-label"
        label="Where is it? Plot as many trees as apply to these details"
        htmlFor="map-and-label-map"
      >
        <ErrorWrapper
          error={mapValidationError}
          id="map-and-label-map-error-wrapper"
        >
          <MapContainer environment="standalone">
            {/* @ts-ignore */}
            <my-map
              id="map-and-label-map"
              ariaLabelOlFixedOverlay={`An interactive map for plotting and describing individual ${schemaName.toLocaleLowerCase()}`}
              height={400}
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
      </InputLabel>
      <Box display="flex" gap={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={async () => await saveItem()}
        >
          Save
        </Button>
        <Button onClick={cancelEditItem}>Cancel</Button>
      </Box>
    </ListCard>
  );
};

const InactiveFeatureCard: React.FC<{
  index: number;
}> = ({ index: i }) => {
  const { schema, formik, removeItem, editItem } = useMapAndLabelContext();

  return (
    <ListCard data-testid={`list-card-${i}`}>
      <Typography component="h2" variant="h3">
        {schema.type}
        {` ${i + 1}`}
      </Typography>
      <Table>
        <TableBody>
          {schema.fields.map((field, j) => (
            <TableRow key={`tableRow-${j}`}>
              <TableCell sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}>
                {field.data.title}
              </TableCell>
              <TableCell>
                {formatSchemaDisplayValue(
                  formik.values.userData[i][field.data.fn],
                  schema.fields[j],
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Box display="flex" gap={2}>
        <CardButton onClick={() => removeItem(i)}>
          <DeleteIcon color="warning" fontSize="medium" />
          Remove
        </CardButton>
        <CardButton onClick={() => editItem(i)}>
          {/* TODO: Is primary colour really right here? */}
          <EditIcon color="primary" fontSize="medium" />
          Edit
        </CardButton>
      </Box>
    </ListCard>
  );
};

const Root = () => {
  const {
    formik,
    validateAndSubmitForm,
    activeIndex,
    schema,
    addNewItem,
    errors,
    mapAndLabelProps,
  } = useMapAndLabelContext();

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

  const rootError: string =
    (errors.min && `You must provide at least ${schema.min} response(s)`) ||
    (errors.max && `You can provide at most ${schema.max} response(s)`) ||
    "";

  // Hide the "+ Add another" button if the schema has a max length of 1, unless the only item has been cancelled/removed (userData = [])
  const shouldShowAddAnotherButton =
    schema.max !== 1 || formik.values.userData.length < 1;

  return (
    <Card handleSubmit={validateAndSubmitForm} isValid>
      <CardHeader
        title={title}
        description={description}
        info={info}
        policyRef={policyRef}
        howMeasured={howMeasured}
      />
      <ErrorWrapper error={rootError}>
        <>
          {formik.values.userData.map((_, i) =>
            i === activeIndex ? (
              <ActiveFeatureCard key={`card-${i}`} index={i} />
            ) : (
              <InactiveFeatureCard key={`card-${i}`} index={i} />
            ),
          )}
          {shouldShowAddAnotherButton && (
            <ErrorWrapper
              error={
                errors.addItem
                  ? `Please save all responses before adding another ${schema.type.toLowerCase()}`
                  : ""
              }
            >
              <Button
                variant="contained"
                color="secondary"
                onClick={addNewItem}
                sx={{ width: "100%" }}
                data-testid="list-add-button"
              >
                + Add another {schema.type.toLowerCase()}
              </Button>
            </ErrorWrapper>
          )}
        </>
      </ErrorWrapper>
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

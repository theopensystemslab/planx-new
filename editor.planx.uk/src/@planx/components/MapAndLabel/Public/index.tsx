import DeleteIcon from "@mui/icons-material/Delete";
import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { SiteAddress } from "@planx/components/FindProperty/model";
import { ErrorSummaryContainer } from "@planx/components/shared/Preview/ErrorSummaryContainer";
import { SchemaFields } from "@planx/components/shared/Schema/SchemaFields";
import { Feature, GeoJsonObject } from "geojson";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import SelectInput from "ui/editor/SelectInput";
import FullWidthWrapper from "ui/public/FullWidthWrapper";
import InputLabel from "ui/public/InputLabel";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import Card from "../../shared/Preview/Card";
import CardHeader from "../../shared/Preview/CardHeader";
import { MapContainer } from "../../shared/Preview/MapContainer";
import { PublicProps } from "../../ui";
import type { MapAndLabel } from "./../model";
import { MapAndLabelProvider, useMapAndLabelContext } from "./Context";

type Props = PublicProps<MapAndLabel>;

export interface PresentationalProps extends Props {
  latitude: number;
  longitude: number;
  boundaryBBox?: GeoJsonObject;
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

const VerticalFeatureTabs: React.FC<{ features: Feature[] }> = ({
  features,
}) => {
  const { schema, activeIndex, formik, editFeature, isFeatureInvalid } =
    useMapAndLabelContext();

  return (
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: "background.paper",
        display: "flex",
        maxHeight: "fit-content",
      }}
    >
      <TabContext value={activeIndex.toString()}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={activeIndex.toString()}
          onChange={(_e, newValue) => {
            editFeature(parseInt(newValue, 10));
          }}
          // TODO!
          aria-label="Vertical tabs example"
          sx={{ borderRight: 1, borderColor: "divider" }}
        >
          {features.map((feature, i) => (
            <Tab
              key={`tab-${i}`}
              value={i.toString()}
              label={`${schema.type} ${feature.properties?.label}`}
              {...a11yProps(i)}
              {...(isFeatureInvalid(i) && {
                sx: (theme) => ({
                  backgroundColor: theme.palette.action.focus,
                }),
              })}
            />
          ))}
        </Tabs>
        {features.map((feature, i) => (
          <TabPanel
            key={`tabpanel-${i}`}
            value={i.toString()}
            sx={{ width: "100%" }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                height: "90px",
              }}
            >
              <Box>
                <Typography component="h2" variant="h3">
                  {`${schema.type} ${feature.properties?.label}`}
                </Typography>
                <Typography variant="body2" mb={2}>
                  {`${feature.geometry.type}`}
                  {feature.geometry.type === "Point"
                    ? ` (${feature.geometry.coordinates.map((coord) =>
                        coord.toFixed(5),
                      )})`
                    : ` (area ${
                        feature.properties?.["area.squareMetres"] || 0
                      } m²)`}
                </Typography>
              </Box>
              {features.length > 1 && (
                <Box>
                  <InputLabel label="Copy from" id={`select-${i}`}>
                    <SelectInput
                      bordered
                      required
                      title={"Copy from"}
                      labelId={`select-label-${i}`}
                      value={""}
                      onChange={() =>
                        console.log(`TODO - Copy data from another tab`)
                      }
                      name={""}
                      style={{ width: "200px" }}
                    >
                      {/* Iterate over all other features */}
                      {features
                        .filter((_, j) => j !== i)
                        .map((option) => (
                          <MenuItem
                            key={option.properties?.label}
                            value={option.properties?.label}
                          >
                            {`${schema.type} ${option.properties?.label}`}
                          </MenuItem>
                        ))}
                    </SelectInput>
                  </InputLabel>
                </Box>
              )}
            </Box>
            <SchemaFields
              sx={(theme) => ({
                display: "flex",
                flexDirection: "column",
                gap: theme.spacing(2),
              })}
              schema={schema}
              activeIndex={activeIndex}
              formik={formik}
            />
            <Button
              onClick={() =>
                console.log(
                  `TODO - Remove ${schema.type} ${feature.properties?.label}`,
                )
              }
              sx={{
                fontWeight: FONT_WEIGHT_SEMI_BOLD,
                gap: (theme) => theme.spacing(2),
                marginTop: 2,
              }}
            >
              <DeleteIcon color="warning" fontSize="medium" />
              Remove
            </Button>
          </TabPanel>
        ))}
      </TabContext>
    </Box>
  );
};

const Root = () => {
  const { validateAndSubmitForm, mapAndLabelProps, errors } =
    useMapAndLabelContext();
  const {
    title,
    description,
    info,
    policyRef,
    howMeasured,
    basemap,
    drawColor,
    drawType,
    schemaName,
    latitude,
    longitude,
    boundaryBBox,
  } = mapAndLabelProps;

  const [features, setFeatures] = useState<Feature[] | undefined>(undefined);
  const { addFeature, schema } = useMapAndLabelContext();

  useEffect(() => {
    const geojsonChangeHandler = ({ detail: geojson }: any) => {
      if (geojson["EPSG:3857"]?.features) {
        setFeatures(geojson["EPSG:3857"].features);
        addFeature();
      } else {
        // if the user clicks 'reset' on the map, geojson will be empty object, so set features to undefined
        setFeatures(undefined);
      }
    };

    const map: HTMLElement | null =
      document.getElementById("map-and-label-map");
    map?.addEventListener("geojsonChange", geojsonChangeHandler);

    return function cleanup() {
      map?.removeEventListener("geojsonChange", geojsonChangeHandler);
    };
  }, [setFeatures, addFeature]);

  const rootError: string =
    (errors.min &&
      `You must plot at least ${schema.min} ${schema.type}(s) on the map`) ||
    (errors.max &&
      `You must plot at most ${schema.max} ${schema.type}(s) on the map`) ||
    "";

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
        <ErrorWrapper error={rootError}>
          <MapContainer environment="standalone">
            {/* @ts-ignore */}
            <my-map
              id="map-and-label-map"
              basemap={basemap}
              ariaLabelOlFixedOverlay={`An interactive map for plotting and describing individual ${schemaName.toLocaleLowerCase()}`}
              drawMode
              drawMany
              drawColor={drawColor}
              drawType={drawType}
              drawPointer="crosshair"
              zoom={20}
              maxZoom={23}
              latitude={latitude}
              longitude={longitude}
              osProxyEndpoint={`${
                import.meta.env.VITE_APP_API_URL
              }/proxy/ordnance-survey`}
              osCopyright={
                basemap === "OSVectorTile"
                  ? `© Crown copyright and database rights ${new Date().getFullYear()} OS (0)100024857`
                  : ``
              }
              clipGeojsonData={boundaryBBox && JSON.stringify(boundaryBBox)}
              mapboxAccessToken={import.meta.env.VITE_APP_MAPBOX_ACCESS_TOKEN}
              collapseAttributions
            />
          </MapContainer>
        </ErrorWrapper>
        {features && features?.length > 0 ? (
          <VerticalFeatureTabs features={features} />
        ) : (
          <Box
            sx={
              {
                /** TODO match figma */
              }
            }
          >
            <Typography variant="body2">
              {`Plot a feature on the map to begin`}
            </Typography>
          </Box>
        )}
      </FullWidthWrapper>
    </Card>
  );
};

export const Presentational: React.FC<PresentationalProps> = (props) => (
  <MapAndLabelProvider {...props}>
    <Root />
  </MapAndLabelProvider>
);

const GraphError = (props: Props) => (
  <Card handleSubmit={props.handleSubmit} isValid>
    <CardHeader title={props.title} description={props.description} />
    <ErrorSummaryContainer
      role="status"
      data-testid="error-summary-invalid-graph"
    >
      <Typography variant="h4" component="h2" gutterBottom>
        Invalid graph
      </Typography>
      <Typography variant="body2">
        Edit this flow so that "MapAndLabel" is positioned after "FindProperty";
        an initial address is required to correctly display the map.
      </Typography>
    </ErrorSummaryContainer>
  </Card>
);

function MapAndLabelComponent(props: Props) {
  const teamSettings = useStore.getState().teamSettings;
  const passport = useStore((state) => state.computePassport());
  const { latitude, longitude } =
    (passport?.data?._address as SiteAddress) || {};

  if (!latitude || !longitude) {
    return <GraphError {...props} />;
  }

  return (
    <Presentational
      {...props}
      latitude={latitude}
      longitude={longitude}
      boundaryBBox={teamSettings.boundaryBBox}
    />
  );
}

export default MapAndLabelComponent;

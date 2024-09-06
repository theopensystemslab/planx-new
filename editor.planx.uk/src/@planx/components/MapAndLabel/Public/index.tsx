import DeleteIcon from "@mui/icons-material/Delete";
import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { lighten, styled } from "@mui/material/styles";
import Tab, { tabClasses, TabProps } from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { SiteAddress } from "@planx/components/FindProperty/model";
import { ErrorSummaryContainer } from "@planx/components/shared/Preview/ErrorSummaryContainer";
import { SchemaFields } from "@planx/components/shared/Schema/SchemaFields";
import { GeoJsonObject } from "geojson";
import sortBy from "lodash/sortBy";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import FullWidthWrapper from "ui/public/FullWidthWrapper";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import Card from "../../shared/Preview/Card";
import CardHeader from "../../shared/Preview/CardHeader";
import { MapContainer } from "../../shared/Preview/MapContainer";
import { PublicProps } from "../../ui";
import type { MapAndLabel } from "./../model";
import { MAP_ID, MapAndLabelProvider, useMapAndLabelContext } from "./Context";
import { CopyFeature } from "./CopyFeature";

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

const StyledTab = styled((props: TabProps) => (
  <Tab {...props} disableFocusRipple disableTouchRipple disableRipple />
))<TabProps>(({ theme }) => ({
  textTransform: "none",
  textAlign: "right",
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  fontSize: theme.typography.body1.fontSize,
  minWidth: "120px",
  [`&.${tabClasses.selected}`]: {
    background: lighten(theme.palette.border.light, 0.2),
    color: theme.palette.text.primary,
  },
})) as typeof Tab;

const VerticalFeatureTabs: React.FC = () => {
  const {
    schema,
    activeIndex,
    formik,
    features,
    editFeature,
    isFeatureInvalid,
    removeFeature,
  } = useMapAndLabelContext();

  if (!features) {
    throw new Error("Cannot render MapAndLabel tabs without features");
  }

  // Features is inherently sorted by recently added/modified, order tabs by stable labels
  const sortedFeatures = sortBy(features, ["properties.label"]);

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
          aria-label="Select a feature to enter data"
          TabIndicatorProps={{
            style: {
              width: "4px",
            },
          }}
          sx={{
            borderRight: 1,
            borderColor: (theme) => theme.palette.border.main,
          }}
        >
          {sortedFeatures.map((feature, i) => (
            <StyledTab
              key={`tab-${i}`}
              value={i.toString()}
              label={`${schema.type} ${feature.properties?.label}`}
              disableRipple
              disableTouchRipple
              {...a11yProps(i)}
              {...(isFeatureInvalid(i) && {
                sx: (theme) => ({
                  borderLeft: `5px solid ${theme.palette.error.main}`,
                }),
              })}
            />
          ))}
        </Tabs>
        {sortedFeatures.map((feature, i) => (
          <TabPanel
            key={`tabpanel-${i}`}
            value={i.toString()}
            sx={{ width: "100%" }}
            aria-labelledby={`vertical-tab-${i}`}
            id={`vertical-tabpanel-${i}`}
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
                <Typography component="h2" variant="h3" gutterBottom>
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
              <CopyFeature features={features} destinationIndex={i} />
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
              onClick={() => removeFeature(activeIndex)}
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

const PlotFeatureToBegin = () => (
  <Box
    sx={(theme) => ({
      backgroundColor: theme.palette.background.paper,
      p: theme.spacing(3),
      textAlign: "center",
      mt: theme.spacing(-1),
      color: theme.typography.body2.color,
      border: `1px solid ${theme.palette.border.main}`,
    })}
  >
    <Typography variant="body2" fontSize={"large"}>
      Plot a feature on the map to begin
    </Typography>
  </Box>
);

const Root = () => {
  const {
    errors,
    features,
    mapAndLabelProps,
    schema,
    updateMapKey,
    validateAndSubmitForm,
    addInitialFeaturesToMap,
  } = useMapAndLabelContext();
  const {
    title,
    description,
    fn,
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
    previouslySubmittedData,
  } = mapAndLabelProps;

  // If coming "back" or "changing", load initial features & tabs onto the map
  //   Pre-populating form fields within tabs is handled via formik.initialValues in Context.tsx
  if (previouslySubmittedData?.data?.[fn]?.features?.length > 0) {
    addInitialFeaturesToMap(previouslySubmittedData?.data?.[fn]?.features);
  }

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
        <ErrorWrapper error={rootError} key={updateMapKey}>
          <MapContainer environment="standalone">
            {/* @ts-ignore */}
            <my-map
              id={MAP_ID}
              data-testid={MAP_ID}
              basemap={basemap}
              ariaLabelOlFixedOverlay={`An interactive map for plotting and describing individual ${schemaName.toLocaleLowerCase()}`}
              drawMode
              drawGeojsonData={
                features &&
                JSON.stringify({
                  type: "FeatureCollection",
                  features: features,
                })
              }
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
          <VerticalFeatureTabs />
        ) : (
          <PlotFeatureToBegin />
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
      boundaryBBox={teamSettings?.boundaryBBox}
    />
  );
}

export default MapAndLabelComponent;

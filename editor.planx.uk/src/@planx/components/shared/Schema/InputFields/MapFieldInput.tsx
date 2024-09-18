import Box from "@mui/material/Box";
import { SiteAddress } from "@opensystemslab/planx-core/types";
import { MapContainer } from "@planx/components/shared/Preview/MapContainer";
import type { MapField } from "@planx/components/shared/Schema/model";
import { GraphError } from "components/Error/GraphError";
import { Feature } from "geojson";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import InputLabel from "ui/public/InputLabel";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import { getFieldProps, Props } from ".";
import { FieldInputDescription } from "./shared";

export const MapFieldInput: React.FC<Props<MapField>> = (props) => {
  // Ensure there's a FindProperty component preceding this field (eg address data in state to position map view)
  const { longitude, latitude } = useStore(
    (state) =>
      (state.computePassport()?.data?.["_address"] as SiteAddress) || {},
  );

  if (!longitude || !latitude)
    throw new GraphError("mapInputFieldMustFollowFindProperty");

  const {
    formik,
    data: { title, description, mapOptions },
  } = props;
  const { id, errorMessage, name } = getFieldProps(props);

  const teamSettings = useStore.getState().teamSettings;
  const passport = useStore((state) => state.computePassport());

  const editableFeatures = props.formik.values.schemaData?.[props.activeIndex]
    ?.features as Feature[];
  const [features, setFeatures] = useState<Feature[] | undefined>(
    editableFeatures?.length > 0 ? editableFeatures : undefined,
  );

  useEffect(() => {
    const geojsonChangeHandler = async ({ detail: geojson }: any) => {
      if (geojson["EPSG:3857"]?.features) {
        setFeatures(geojson["EPSG:3857"].features);
        formik.setFieldValue(name, geojson["EPSG:3857"].features);
      } else {
        // if the user clicks 'reset' on the map, geojson will be empty object, so set features to undefined
        setFeatures(undefined);
        formik.setFieldValue(name, undefined);
      }
    };

    const map: any = document.getElementById(id);

    map?.addEventListener("geojsonChange", geojsonChangeHandler);

    return function cleanup() {
      map?.removeEventListener("geojsonChange", geojsonChangeHandler);
    };
  }, [setFeatures]);

  return (
    <Box sx={{ "& > label": { maxWidth: "100% !important" } }}>
      <InputLabel label={title} id={`map-label-${id}`} htmlFor={id}>
        {description && <FieldInputDescription description={description} />}
        <ErrorWrapper error={errorMessage} id={id}>
          <MapContainer environment="standalone">
            {/* @ts-ignore */}
            <my-map
              id={id}
              // TODO
              // ariaLabelOlFixedOverlay={`An interactive map for plotting and describing ${schema.type.toLocaleLowerCase()}`}
              height={400}
              basemap={mapOptions?.basemap}
              drawMode
              drawGeojsonData={
                features &&
                JSON.stringify({
                  type: "FeatureCollection",
                  features: features,
                })
              }
              drawMany={mapOptions?.drawMany}
              drawColor={mapOptions?.drawColor}
              drawType={mapOptions?.drawType}
              drawPointer="crosshair"
              zoom={20}
              maxZoom={23}
              latitude={Number(passport?.data?._address?.latitude)}
              longitude={Number(passport?.data?._address?.longitude)}
              osProxyEndpoint={`${
                import.meta.env.VITE_APP_API_URL
              }/proxy/ordnance-survey`}
              osCopyright={
                mapOptions?.basemap === "OSVectorTile"
                  ? `Basemap subject to Crown copyright and database rights ${new Date().getFullYear()} OS (0)100024857`
                  : ``
              }
              clipGeojsonData={
                teamSettings?.boundaryBBox &&
                JSON.stringify(teamSettings?.boundaryBBox)
              }
              mapboxAccessToken={import.meta.env.VITE_APP_MAPBOX_ACCESS_TOKEN}
              collapseAttributions
            />
          </MapContainer>
        </ErrorWrapper>
      </InputLabel>
    </Box>
  );
};

import { MapContainer } from "@planx/components/shared/Preview/MapContainer";
import type { MapField } from "@planx/components/shared/Schema/model";
import { Feature } from "geojson";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import InputLabel from "ui/public/InputLabel";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import { getFieldProps, Props } from ".";

export const MapFieldInput: React.FC<Props<MapField>> = (props) => {
  const {
    formik,
    data: { title, mapOptions },
  } = props;
  const { id, errorMessage, name } = getFieldProps(props);

  const teamSettings = useStore.getState().teamSettings;
  const passport = useStore((state) => state.computePassport());

  const [_features, setFeatures] = useState<Feature[] | undefined>(undefined);

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
    <InputLabel label={title} id={`map-label-${id}`} htmlFor={id}>
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
            osCopyright={`Basemap subject to Crown copyright and database rights ${new Date().getFullYear()} OS (0)100024857`}
            clipGeojsonData={
              teamSettings?.boundaryBBox &&
              JSON.stringify(teamSettings?.boundaryBBox)
            }
          />
        </MapContainer>
      </ErrorWrapper>
    </InputLabel>
  );
};

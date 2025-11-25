import { visuallyHidden } from "@mui/utils";
import type { GeoJsonObject } from "geojson";
import React, { Fragment } from "react";

export const PreviewMap: React.FC<{ geojsonData?: GeoJsonObject }> = ({
  geojsonData,
}) => {
  if (!geojsonData) return;

  return (
    <Fragment key={JSON.stringify(geojsonData)}>
      <p style={visuallyHidden}>
        A static map displaying your team's boundary.
      </p>
      {/* @ts-ignore */}
      <my-map
        id="team-boundary-map"
        ariaLabelOlFixedOverlay="A static map displaying your team's boundary"
        geojsonData={JSON.stringify(geojsonData)}
        geojsonColor="#ff0000"
        geojsonFill
        geojsonBuffer={1_000}
        osProxyEndpoint={`${
          import.meta.env.VITE_APP_API_URL
        }/proxy/ordnance-survey`}
        hideResetControl
        staticMode
        style={{ width: "100%", height: "30vh" }}
        osCopyright={`© Crown copyright and database rights ${new Date().getFullYear()} OS AC0000812160`}
        collapseAttributions
      />
    </Fragment>
  );
};

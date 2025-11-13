import Typography from "@mui/material/Typography";
import type { GeoJsonObject } from "geojson";
import React from "react";
import InputLegend from "ui/editor/InputLegend";
import SettingsDescription from "ui/editor/SettingsDescription";
import SettingsSection from "ui/editor/SettingsSection";

import { PreviewMap } from "./PreviewMap";

export const SLPInfo: React.FC<{ geojsonData?: GeoJsonObject }> = ({
  geojsonData,
}) => (
  // TODO: new setting section
  <SettingsSection background>
    <InputLegend>Boundary</InputLegend>
    <SettingsDescription>
      <Typography
        variant="body2"
        color={(theme) => theme.palette.text.secondary}
      >
        Tewkesbury, Cheltenham and Gloucestershire share a Strategic and Local
        Plan (SLP). Planning applicantions can span across boundaries of these
        three authorities.
      </Typography>
    </SettingsDescription>
    <PreviewMap geojsonData={geojsonData} />
  </SettingsSection>
);

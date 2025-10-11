import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import { bbox } from "@turf/bbox";
import { bboxPolygon } from "@turf/bbox-polygon";
import axios, { isAxiosError } from "axios";
import { useFormik } from "formik";
import type { Feature, GeoJsonObject, MultiPolygon, Polygon } from "geojson";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { ChangeEvent } from "react";
import { useCurrentRoute } from "react-navi";
import InputLabel from "ui/editor/InputLabel";
import InputLegend from "ui/editor/InputLegend";
import SettingsDescription from "ui/editor/SettingsDescription";
import SettingsSection from "ui/editor/SettingsSection";
import Input from "ui/shared/Input/Input";
import * as Yup from "yup";

import { SettingsForm } from "../shared/SettingsForm";
import { FormProps } from ".";

export type PlanningDataEntity = Feature<
  Polygon | MultiPolygon,
  Record<string, unknown>
>;

const PreviewMap: React.FC<{ geojsonData?: GeoJsonObject }> = ({
  geojsonData,
}) => {
  if (!geojsonData) return;

  return (
    <>
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
    </>
  );
};

const BoundaryDescription: React.FC = () => (
  <>
    <p>
      The boundary URL is used to retrieve the outer boundary of your council
      area. The bounding box of your boundary (shown below) limits the area
      applicants can access via the map within your services.
    </p>
    <p>
      The detailed boundary is still referenced when planning constraints are
      checked.
    </p>
    <p>
      The boundary should be given as a link from:{" "}
      <a
        href="https://www.planning.data.gov.uk/"
        target="_blank"
        rel="noopener noreferrer"
      >
        https://www.planning.data.gov.uk/entity/1234567
      </a>
    </p>
  </>
);

const SLPInfo: React.FC<{ geojsonData?: GeoJsonObject }> = ({
  geojsonData,
}) => (
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

/**
 * Convert a complex local authority boundary to a simplified bounding box
 */
const convertToBoundingBox = (feature: PlanningDataEntity): Feature<Polygon> =>
  bboxPolygon(bbox(feature));

export default function BoundaryForm({ formikConfig, onSuccess }: FormProps) {
  const planningDataURLRegex =
    /^https:\/\/www\.planning\.data\.gov\.uk\/entity\/\d{1,7}$/;

  const formSchema = Yup.object().shape({
    boundaryUrl: Yup.string()
      .matches(
        planningDataURLRegex,
        "Enter a boundary URL in the correct format, https://www.planning.data.gov.uk/entity/1234567",
      )
      .required("Enter a boundary URL"),
  });

  const formik = useFormik({
    ...formikConfig,
    validationSchema: formSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        // Fetch boundary from Planning Data
        const { data } = await axios.get<PlanningDataEntity>(
          `${values.boundaryUrl}.geojson`,
        );

        // Transform and update formik state
        const boundaryBBox = convertToBoundingBox(data);
        formik.setFieldValue("boundaryBBox", boundaryBBox);

        // Update database
        const isUpdateSuccess = await useStore.getState().updateTeamSettings({
          boundaryUrl: values.boundaryUrl,
          boundaryBBox,
        });
        if (isUpdateSuccess) {
          onSuccess();
          resetForm({ values });
        }
      } catch (error) {
        if (isAxiosError(error)) {
          formik.setFieldError(
            "boundaryUrl",
            "We are unable to retrieve your boundary, check your boundary URL and try again",
          );
        }
        console.error(error);
      }
    },
  });

  const route = useCurrentRoute();
  const teamSlug = route.data.team;

  // Cheltenham, Gloucester and Tewkesbury share a Strategic Local Plan
  //  This joint boundary is not hosted on PD, so we override the usual self-service input
  const isSLPTeam = ["strategic-and-local-plan", "tewkesbury"].includes(teamSlug);

  if (isSLPTeam) return <SLPInfo geojsonData={formik.values.boundaryBBox} />;

  return (
    <SettingsForm
      formik={formik}
      legend="Boundary (bounding box)"
      description={<BoundaryDescription />}
      input={
        <>
          <InputLabel label="Boundary URL" htmlFor="boundaryUrl">
            <Input
              name="boundary"
              value={formik.values.boundaryUrl}
              errorMessage={formik.errors.boundaryUrl}
              onChange={(ev: ChangeEvent<HTMLInputElement>) => {
                formik.setFieldValue("boundaryUrl", ev.target.value);
              }}
              id="boundaryUrl"
            />
          </InputLabel>
          <PreviewMap
            key={JSON.stringify(formik.values.boundaryBBox)}
            geojsonData={formik.values.boundaryBBox}
          />
        </>
      }
    ></SettingsForm>
  );
}

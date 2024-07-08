import { bbox } from "@turf/bbox";
import { bboxPolygon } from "@turf/bbox-polygon";
import axios, { isAxiosError } from "axios";
import { useFormik } from "formik";
import type { Feature, MultiPolygon, Polygon } from "geojson";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { ChangeEvent } from "react";
import InputLabel from "ui/editor/InputLabel";
import Input from "ui/shared/Input";
import * as Yup from "yup";

import { SettingsForm } from "../shared/SettingsForm";
import { FormProps } from ".";

export type PlanningDataEntity = Feature<
  Polygon | MultiPolygon,
  Record<string, unknown>
>;

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
        const { data } = await axios.get<PlanningDataEntity>(
          `${values.boundaryUrl}.geojson`,
        );

        const isUpdateSuccess = await useStore.getState().updateTeamSettings({
          boundaryUrl: values.boundaryUrl,
          boundaryBbox: convertToBoundingBox(data),
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

  return (
    <SettingsForm
      formik={formik}
      legend="Boundary"
      description={
        <>
          <p>
            The boundary URL is used to retrieve the outer boundary of your
            council area. This can then help users define whether they are
            within your council area.
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
      }
      input={
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
      }
    />
  );
}

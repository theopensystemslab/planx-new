import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { ChangeEvent } from "react";
import InputLabel from "ui/editor/InputLabel";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input";
import * as Yup from "yup";

import { SettingsForm } from "../shared/SettingsForm";
import { FormProps } from ".";

export default function BoundaryForm({ formikConfig, onSuccess }: FormProps) {
  const formSchema = Yup.object().shape({
    boundaryUrl: Yup.string()
      .url("URL's must look like the example given above")
      .required("Enter a boundary URL"),
  });
  const formik = useFormik({
    ...formikConfig,
    validationSchema: formSchema,
    onSubmit: async (values, { resetForm }) => {
      const isSuccess = await useStore.getState().updateTeamSettings({
        boundaryUrl: values.boundaryUrl,
      });
      if (isSuccess) {
        onSuccess();
        resetForm({ values });
      }
    },
  });

  return (
    <SettingsForm
      formik={formik}
      legend="Boundary"
      isErrors={false}
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
              https://www.planning.data.gov.uk/
            </a>
          </p>
        </>
      }
      input={
        <ErrorWrapper
          error={Object.values(formik.errors).join(", ")}
          id="settings-error"
        >
          <InputLabel label="Boundary URL" htmlFor="boundaryUrl">
            <Input
              name="boundary"
              value={formik.values.boundaryUrl}
              onChange={(ev: ChangeEvent<HTMLInputElement>) => {
                formik.setFieldValue("boundaryUrl", ev.target.value);
              }}
              id="boundaryUrl"
            />
          </InputLabel>
        </ErrorWrapper>
      }
    />
  );
}

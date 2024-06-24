import { useFormik } from "formik";
import React, { ChangeEvent } from "react";
import InputDescription from "ui/editor/InputDescription";
import Input from "ui/shared/Input";
import InputRow from "ui/shared/InputRow";
import InputRowLabel from "ui/shared/InputRowLabel";

import { SettingsForm } from "../shared/SettingsForm";
import { FormProps } from ".";

export default function BoundaryForm({ formikConfig, onSuccess }: FormProps) {
  const formik = useFormik({
    ...formikConfig,
    onSubmit(values, { resetForm }) {
      onSuccess();
      resetForm({ values });
    },
  });

  return (
    <SettingsForm
      formik={formik}
      legend="Boundary"
      description={
        <InputDescription>
          The boundary URL is used to retrieve the outer boundary of your
          council area. This can then help users define whether they are within
          your council area.
          <br />
          <br />
          The boundary should be given as a link from:{" "}
          <a
            href="https://www.planning.data.gov.uk/"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://www.planning.data.gov.uk/
          </a>
        </InputDescription>
      }
      input={
        <>
          <InputRow>
            <InputRowLabel>
              Boundary URL
              <Input
                name="boundary"
                value={formik.values.boundaryUrl}
                onChange={(ev: ChangeEvent<HTMLInputElement>) => {
                  formik.setFieldValue("boundaryUrl", ev.target.value);
                }}
              />
            </InputRowLabel>
          </InputRow>
        </>
      }
    />
  );
}

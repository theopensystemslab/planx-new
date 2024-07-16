import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { ChangeEvent } from "react";
import InputLabel from "ui/editor/InputLabel";
import Input from "ui/shared/Input";
import * as Yup from "yup";

import { SettingsForm } from "../shared/SettingsForm";
import { FormProps } from ".";

export default function ReferenceCodeForm({
  formikConfig,
  onSuccess,
}: FormProps) {
  const formSchema = Yup.object().shape({
    referenceCode: Yup.string()
      .min(3, "Code must be 3 characters long")
      .max(3, "Code must be 3 characters long")
      .required("Enter a reference code"),
  });

  const formik = useFormik({
    ...formikConfig,
    validationSchema: formSchema,
    onSubmit: async (values, { resetForm }) => {
      const isSuccess = await useStore.getState().updateTeamSettings({
        referenceCode: values.referenceCode,
      });
      if (isSuccess) {
        onSuccess();
        resetForm({ values });
      }
    },
  });

  const onChangeFn = (type: string, event: ChangeEvent<HTMLInputElement>) =>
    formik.setFieldValue(type, event.target.value.toUpperCase());

  return (
    <SettingsForm
      legend="Local authority reference code"
      formik={formik}
      description={
        <>
          <Typography variant="body2">
            Your local authority reference code is required for submissions.
            This is a unique three-letter code per local authority.
          </Typography>
          <Typography variant="body2">
            The reference code can be found from Planning Data at:{" "}
            <Link
              href="https://www.planning.data.gov.uk/entity/?dataset=local-authority"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://www.planning.data.gov.uk/entity/?dataset=local-authority
            </Link>
          </Typography>
        </>
      }
      input={
        <>
          <InputLabel label="Reference code" htmlFor="referenceCode">
            <Input
              name="referenceCode"
              onChange={(event) => {
                onChangeFn("referenceCode", event);
              }}
              value={formik.values.referenceCode ?? ""}
              errorMessage={formik.errors.referenceCode}
              id="homepage"
            />
          </InputLabel>
        </>
      }
    />
  );
}

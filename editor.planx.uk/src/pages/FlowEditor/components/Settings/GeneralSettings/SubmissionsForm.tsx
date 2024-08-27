import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import InputLabel from "ui/editor/InputLabel";
import Input from "ui/shared/Input";
import * as Yup from "yup";

import { SettingsForm } from "../shared/SettingsForm";
import { FormProps } from ".";

export default function SubmissionForm({ formikConfig, onSuccess }: FormProps) {
  const formSchema = Yup.object().shape({
    submissionEmail: Yup.string().email("Enter a valid email address"),
  });

  const formik = useFormik({
    ...formikConfig,
    validationSchema: formSchema,
    onSubmit: async (values, { resetForm }) => {
      const isSuccess = await useStore.getState().updateTeamSettings({
        submissionEmail: values.submissionEmail,
      });
      if (isSuccess) {
        onSuccess();
        resetForm({ values });
      }
    },
  });

  return (
    <SettingsForm
      legend="Submission Information"
      formik={formik}
      description={
        <>
          <Typography variant="body2">
            The email address used by the Send component to send applications to
            your planning office.
          </Typography>
        </>
      }
      input={
        <>
          <InputLabel label="Submission email" htmlFor="submissionEmail">
            <Input
              name="submissionEmail"
              onChange={(event) => {
                formik.setFieldValue("submissionEmail", event.target.value);
              }}
              value={formik.values.submissionEmail ?? ""}
              errorMessage={formik.errors.submissionEmail}
              id="submissionEmail"
            />
          </InputLabel>
        </>
      }
    />
  );
}

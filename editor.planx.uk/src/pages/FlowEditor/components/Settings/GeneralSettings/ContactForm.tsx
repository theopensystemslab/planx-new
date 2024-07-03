import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { ChangeEvent } from "react";
import InputLabel from "ui/editor/InputLabel";
import Input from "ui/shared/Input";
import * as Yup from "yup";

import { SettingsForm } from "../shared/SettingsForm";
import { FormProps } from ".";

export default function ContactForm({ formikConfig, onSuccess }: FormProps) {
  const formSchema = Yup.object().shape({
    helpEmail: Yup.string()
      .email("Please enter valid email")
      .required("Help Email is required"),
    helpPhone: Yup.string().required("Help Phone is required"),
    helpOpeningHours: Yup.string(),
    homepage: Yup.string().url("Please enter a valid URL for the homepage"),
  });

  const formik = useFormik({
    ...formikConfig,
    validationSchema: formSchema,
    onSubmit: async (values, { resetForm }) => {
      const isSuccess = await useStore.getState().updateTeamSettings({
        helpEmail: values.helpEmail,
        helpOpeningHours: values.helpOpeningHours,
        helpPhone: values.helpPhone,
      });
      if (isSuccess) {
        onSuccess();
        resetForm({ values });
      }
    },
  });

  const onChangeFn = (type: string, event: ChangeEvent<HTMLInputElement>) =>
    formik.setFieldValue(type, event.target.value);

  return (
    <SettingsForm
      legend="Contact Information"
      formik={formik}
      description={
        <>
          Details to help direct different messages, feedback, and enquiries
          from users.
        </>
      }
      input={
        <>
          <InputLabel label="Homepage URL" htmlFor="homepageUrl">
            <Input
              name="homepage"
              onChange={(event) => {
                onChangeFn("homepage", event);
              }}
              id="homepageUrl"
            />
          </InputLabel>
          <InputLabel label="Contact email address" htmlFor="helpEmail">
            <Input
              name="helpEmail"
              onChange={(event) => {
                onChangeFn("helpEmail", event);
              }}
              id="helpEmail"
            />
          </InputLabel>
          <InputLabel label="Phone number" htmlFor="helpPhone">
            <Input
              name="helpPhone"
              onChange={(event) => {
                onChangeFn("helpPhone", event);
              }}
              id="helpPhone"
            />
          </InputLabel>
          <InputLabel label="Opening hours" htmlFor="helpOpeningHours">
            <Input
              multiline
              name="helpOpeningHours"
              onChange={(event) => {
                onChangeFn("helpOpeningHours", event);
              }}
              id="helpOpeningHours"
            />
          </InputLabel>
        </>
      }
    />
  );
}

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
      .email(
        "Enter an email address in the correct format, like example@email.com",
      )
      .required("Enter a contact email address"),
    helpPhone: Yup.string().required("Enter a phone number"),
    helpOpeningHours: Yup.string().required("Enter your opening hours"),
    homepage: Yup.string()
      .url(
        "Enter a homepage URL in the correct format, like https://www.localauthority.gov.uk/",
      )
      .required("Enter a homepage"),
  });

  const formik = useFormik({
    ...formikConfig,
    validationSchema: formSchema,
    onSubmit: async (values, { resetForm }) => {
      const isSuccess = await useStore.getState().updateTeamSettings({
        helpEmail: values.helpEmail,
        helpOpeningHours: values.helpOpeningHours,
        helpPhone: values.helpPhone,
        homepage: values.homepage,
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
          <InputLabel label="Homepage URL" htmlFor="homepage">
            <Input
              name="homepage"
              onChange={(event) => {
                onChangeFn("homepage", event);
              }}
              value={formik.values.homepage}
              errorMessage={formik.errors.homepage}
              id="homepage"
            />
          </InputLabel>
          <InputLabel label="Contact email address" htmlFor="helpEmail">
            <Input
              name="helpEmail"
              value={formik.values.helpEmail}
              errorMessage={formik.errors.helpEmail}
              onChange={(event) => {
                onChangeFn("helpEmail", event);
              }}
              id="helpEmail"
            />
          </InputLabel>
          <InputLabel label="Phone number" htmlFor="helpPhone">
            <Input
              name="helpPhone"
              value={formik.values.helpPhone}
              errorMessage={formik.errors.helpPhone}
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
              value={formik.values.helpOpeningHours}
              errorMessage={formik.errors.helpOpeningHours}
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

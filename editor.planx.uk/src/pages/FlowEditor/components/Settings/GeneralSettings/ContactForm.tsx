import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { ChangeEvent } from "react";
import InputLabel from "ui/editor/InputLabel";
import Input from "ui/shared/Input";
import InputRow from "ui/shared/InputRow";
import InputRowLabel from "ui/shared/InputRowLabel";
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
        homepage: values.homepage,
        helpEmail: values.helpEmail,
        helpPhone: values.helpPhone,
        helpOpeningHours: values.helpOpeningHours,
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
          <InputRow>
            <InputRowLabel>
              Homepage URL
              <Input
                name="homepage"
                value={formik.values.homepage}
                onChange={(event) => {
                  onChangeFn("homepage", event);
                }}
              />
            </InputRowLabel>
          </InputRow>
          <InputRow>
            <InputRowLabel>
              Contact email address
              <Input
                name="helpEmail"
                value={formik.values.helpEmail}
                onChange={(event) => {
                  onChangeFn("helpEmail", event);
                }}
              />
            </InputRowLabel>
          </InputRow>
          <InputRow>
            <InputRowLabel>
              Phone number
              <Input
                name="helpPhone"
                value={formik.values.helpPhone}
                onChange={(event) => {
                  onChangeFn("helpPhone", event);
                }}
              />
            </InputRowLabel>
          </InputRow>
          <InputRow>
            <InputRowLabel>
              Opening hours
              <Input
                multiline
                name="helpOpeningHours"
                value={formik.values.helpOpeningHours}
                onChange={(event) => {
                  onChangeFn("helpOpeningHours", event);
                }}
              />
            </InputRowLabel>
          </InputRow>
        </>
      }
    />
  );
}

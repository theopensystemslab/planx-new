import { useFormik } from "formik";
import React, { ChangeEvent } from "react";
import InputDescription from "ui/editor/InputDescription";
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
  });

  const formik = useFormik({
    ...formikConfig,
    validationSchema: formSchema,
    onSubmit(values, { resetForm }) {
      onSuccess();
      resetForm({ values });
    },
  });

  const onChangeFn = (type: string, event: ChangeEvent<HTMLInputElement>) =>
    formik.setFieldValue(type, event.target.value);

  return (
    <SettingsForm
      legend="Contact Information"
      formik={formik}
      description={
        <InputDescription>
          Details to help direct different messages, feedback, and enquiries
          from users.
        </InputDescription>
      }
      input={
        <>
          <InputRow>
            <InputRowLabel>
              Contact email address
              <Input
                name="helpEmail"
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

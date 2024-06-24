import { useFormik } from "formik";
import React, { ChangeEvent } from "react";
import InputDescription from "ui/editor/InputDescription";
import Input from "ui/shared/Input";
import InputRow from "ui/shared/InputRow";
import InputRowLabel from "ui/shared/InputRowLabel";

import { SettingsForm } from "../shared/SettingsForm";
import { FormProps } from ".";

export default function ContactForm({ formikConfig, onSuccess }: FormProps) {
  const formik = useFormik({
    ...formikConfig,
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
              Help Email
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
              Help Phone
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
              Help Opening Hours
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

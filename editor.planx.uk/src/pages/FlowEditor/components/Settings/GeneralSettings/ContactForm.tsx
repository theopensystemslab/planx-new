import axios from "axios";
import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { ChangeEvent } from "react";
import InputLabel from "ui/editor/InputLabel";
import Input from "ui/shared/Input/Input";
import * as Yup from "yup";

import { SettingsForm } from "../shared/SettingsForm";
import { FormProps } from ".";

export default function ContactForm({ formikConfig, onSuccess }: FormProps) {
  const [teamSlug, token, helpEmail] = useStore((state) => [
    state.teamSlug,
    state.jwt,
    state.teamSettings.helpEmail,
  ]);

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
      const updatedEmail = helpEmail !== values.helpEmail;
      const isSuccess = await useStore.getState().updateTeamSettings({
        helpEmail: values.helpEmail,
        helpOpeningHours: values.helpOpeningHours,
        helpPhone: values.helpPhone,
        homepage: values.homepage,
      });

      if (isSuccess) {
        onSuccess();

        if (updatedEmail) {
          // Send a Slack notification to #planx-notifications with new email
          //   Gov Notify does not have an API for configuring reply-to emails, so a dev needs to pick up
          sendEmailChangeSlackNotification(values.helpEmail);
        }

        resetForm({ values });
      }
    },
  });

  const onChangeFn = (type: string, event: ChangeEvent<HTMLInputElement>) =>
    formik.setFieldValue(type, event.target.value);

  const sendEmailChangeSlackNotification = async (newEmail: string) => {
    const skipTeamSlugs = [
      "open-digital-planning",
      "opensystemslab",
      "planx",
      "planx-university",
      "templates",
      "testing",
      "wikihouse",
    ];
    if (skipTeamSlugs.includes(teamSlug)) return;

    const message = `:e-mail: *${teamSlug}* updated their Gov UK Notify reply-to email to *${newEmail}*; ensure this is configured in Gov UK Notify dashboard.`;

    return axios.post(
      `${import.meta.env.VITE_APP_API_URL}/send-slack-notification`,
      {
        message: message,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  };

  return (
    <SettingsForm
      legend="Contact information"
      formik={formik}
      description={
        <>
          Populates Gov UK Notify templates for email replies and footer contact
          information. Gov UK Notify templates apply to all submission services.
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
              value={formik.values.homepage ?? ""}
              errorMessage={formik.errors.homepage}
              id="homepage"
            />
          </InputLabel>
          <InputLabel label="Reply-to email address" htmlFor="helpEmail">
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

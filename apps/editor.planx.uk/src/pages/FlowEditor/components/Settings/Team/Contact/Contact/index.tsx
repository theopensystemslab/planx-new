import { useSlackMessage } from "pages/FlowEditor/components/Settings/hooks/useSlackMessage";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { ChangeEvent } from "react";
import InputLabel from "ui/editor/InputLabel";
import Input from "ui/shared/Input/Input";

import SettingsFormContainer from "../../../shared/SettingsForm";
import { GET_TEAM_SETTINGS, UPDATE_TEAM_SETTINGS } from "./queries";
import { defaultValues, validationSchema } from "./schema";
import {
  ContactFormValues,
  GetTeamSettingsData,
  UpdateTeamSettingsVariables,
} from "./types";

export const Contact: React.FC = () => {
  const [teamId, teamSlug] = useStore((state) => [
    state.teamId,
    state.teamSlug,
  ]);

  const { mutate: sendSlackMessage } = useSlackMessage();

  return (
    <SettingsFormContainer<
      GetTeamSettingsData,
      UpdateTeamSettingsVariables,
      ContactFormValues
    >
      query={GET_TEAM_SETTINGS}
      defaultValues={defaultValues}
      queryVariables={{ slug: teamSlug }}
      mutation={UPDATE_TEAM_SETTINGS}
      getInitialValues={({ teams: [team] }) => team.settings}
      getMutationVariables={(values) => ({
        teamId,
        settings: {
          help_email: values.helpEmail,
          help_phone: values.helpPhone,
          help_opening_hours: values.helpOpeningHours,
          homepage: values.homepage,
        },
      })}
      validationSchema={validationSchema}
      legend="Contact information"
      description={
        <>
          Populates Gov UK Notify templates for email replies and footer contact
          information. Gov UK Notify templates apply to all submission services.
        </>
      }
      onSuccess={(data, _formikHelpers, values) => {
        const oldEmail = data?.teams[0].settings.helpEmail;
        const hasEmailUpdated = oldEmail && values.helpEmail !== oldEmail;
        if (hasEmailUpdated) {
          const message = `:e-mail: *${teamSlug}* updated their Gov UK Notify reply-to email to *${values.helpEmail}*; ensure this is configured in Gov UK Notify dashboard.`;
          sendSlackMessage(message);
        }
      }}
    >
      {({ formik }) => (
        <>
          <InputLabel label="Homepage URL" htmlFor="homepage">
            <Input
              name="homepage"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                formik.setFieldValue("homepage", e.target.value)
              }
              value={formik.values.homepage}
              errorMessage={formik.errors.homepage}
              id="homepage"
            />
          </InputLabel>

          <InputLabel label="Reply-to email address" htmlFor="helpEmail">
            <Input
              name="helpEmail"
              value={formik.values.helpEmail}
              errorMessage={formik.errors.helpEmail}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                formik.setFieldValue("helpEmail", e.target.value);
              }}
              id="helpEmail"
            />
          </InputLabel>

          <InputLabel label="Phone number" htmlFor="helpPhone">
            <Input
              name="helpPhone"
              value={formik.values.helpPhone}
              errorMessage={formik.errors.helpPhone}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                formik.setFieldValue("helpPhone", e.target.value)
              }
              id="helpPhone"
            />
          </InputLabel>

          <InputLabel label="Opening hours" htmlFor="helpOpeningHours">
            <Input
              name="helpOpeningHours"
              value={formik.values.helpOpeningHours}
              errorMessage={formik.errors.helpOpeningHours}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                formik.setFieldValue("helpOpeningHours", e.target.value)
              }
              id="helpOpeningHours"
            />
          </InputLabel>
        </>
      )}
    </SettingsFormContainer>
  );
};

export default Contact;

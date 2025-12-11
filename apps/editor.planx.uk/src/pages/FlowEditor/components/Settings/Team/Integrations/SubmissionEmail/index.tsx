import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { ChangeEvent } from "react";
import InputLabel from "ui/editor/InputLabel";
import Input from "ui/shared/Input/Input";

import SettingsFormContainer from "../../../shared/SettingsForm";
import { GET_TEAM_SETTINGS, UPDATE_TEAM_SETTINGS } from "./queries";
import { defaultValues, validationSchema } from "./schema";
import {
  GetTeamSettingsData,
  SubmissionEmailFormValues,
  UpdateTeamSettingsVariables,
} from "./types";

export const SubmissionEmail: React.FC = () => {
  const [teamId, teamSlug] = useStore((state) => [
    state.teamId,
    state.teamSlug,
  ]);

  return (
    <SettingsFormContainer<
      GetTeamSettingsData,
      UpdateTeamSettingsVariables,
      SubmissionEmailFormValues
    >
      query={GET_TEAM_SETTINGS}
      defaultValues={defaultValues}
      queryVariables={{ slug: teamSlug }}
      mutation={UPDATE_TEAM_SETTINGS}
      getInitialValues={({ teams: [team] }) => team.settings}
      getMutationVariables={(values) => ({
        teamId,
        settings: {
          submission_email: values.submissionEmail,
        },
      })}
      validationSchema={validationSchema}
      legend="Submission information"
      description={
        <>
          <Typography variant="body2">
            If your Send component has the 'Email to planning office' option
            selected, submissions are sent to this address.
          </Typography>
        </>
      }
    >
      {({ formik }) => (
        <InputLabel label="Submission email" htmlFor="submissionEmail">
          <Input
            name="submissionEmail"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              formik.setFieldValue("submissionEmail", e.target.value)
            }
            value={formik.values.submissionEmail ?? ""}
            errorMessage={
              typeof formik.errors.submissionEmail === "string"
                ? formik.errors.submissionEmail
                : undefined
            }
            id="submissionEmail"
          />
        </InputLabel>
      )}
    </SettingsFormContainer>
  );
};

export default SubmissionEmail;

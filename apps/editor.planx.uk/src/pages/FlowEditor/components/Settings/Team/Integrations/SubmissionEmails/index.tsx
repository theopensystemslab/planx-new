import Typography from "@mui/material/Typography";
import { getIn } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { ChangeEvent } from "react";
import InputLabel from "ui/editor/InputLabel";
import Input from "ui/shared/Input/Input";

import SettingsFormContainer from "../../../shared/SettingsForm";
import {
  GET_TEAM_SUBMISSION_INTEGRATIONS,
  UPDATE_TEAM_SUBMISSION_INTEGRATIONS,
} from "./queries";
import { defaultValues, validationSchema } from "./schema";
import {
  GetTeamSubmissionIntegrationsData,
  SubmissionEmailFormValues,
  UpdateTeamSubmissionIntegrationsVariables,
} from "./types";

// Parallel feature to SubmissionEmail (singular)
export const SubmissionEmails: React.FC = () => {
  const teamId = useStore((state) => state.teamId);
  console.log({ teamId });

  return (
    <SettingsFormContainer<
      GetTeamSubmissionIntegrationsData,
      SubmissionEmailFormValues,
      UpdateTeamSubmissionIntegrationsVariables
    >
      query={GET_TEAM_SUBMISSION_INTEGRATIONS}
      defaultValues={defaultValues}
      queryVariables={{ teamId }}
      mutation={UPDATE_TEAM_SUBMISSION_INTEGRATIONS}
      getInitialValues={({ submissionIntegrations }) =>
        submissionIntegrations?.[0] || defaultValues
      }
      getMutationVariables={(values) => ({
        teamId,
        submissionEmail: values.submissionEmail,
        defaultEmail: values.defaultEmail,
      })}
      validationSchema={validationSchema}
      legend="Submission information"
      description={
        <>
          <Typography variant="body2">
            Enter multiple email addresses to receive applications. You can
            assign one email address per service. A default address must be
            selected, which will be used as a fallback for all applications.
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
            value={formik.values.submissionEmail}
            errorMessage={getIn(formik.errors, "submissionEmail")}
            id="submissionEmail"
          />
        </InputLabel>
      )}
    </SettingsFormContainer>
  );
};

export default SubmissionEmails;

import Box from "@mui/material/Box";
import RadioGroup from "@mui/material/RadioGroup";
import Typography from "@mui/material/Typography";
import BasicRadio from "@planx/components/shared/Radio/BasicRadio/BasicRadio";
import { FormikErrors, getIn } from "formik";
import { FormikProps } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import ListManager, { EditorProps } from "ui/editor/ListManager/ListManager";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import SettingsFormContainer from "../../../shared/SettingsForm";
import { EmailsTable } from "./EmailsTable";
import {
  GET_TEAM_SUBMISSION_INTEGRATIONS,
  UPSERT_TEAM_SUBMISSION_INTEGRATIONS,
} from "./queries";
import { defaultValues, validationSchema } from "./schema";
import {
  GetSubmissionEmails,
  SubmissionEmailInput,
  SubmissionEmailMutation,
  SubmissionEmailValues,
  UpdateTeamSubmissionIntegrationsVariables,
} from "./types";

export const SubmissionEmails: React.FC = () => {
  const teamId = useStore((state) => state.teamId);

  return (
    <SettingsFormContainer<
      GetSubmissionEmails,
      UpdateTeamSubmissionIntegrationsVariables,
      SubmissionEmailValues
    >
      query={GET_TEAM_SUBMISSION_INTEGRATIONS}
      defaultValues={defaultValues}
      queryVariables={{ teamId }}
      mutation={UPSERT_TEAM_SUBMISSION_INTEGRATIONS}
      getInitialValues={({ submissionIntegrations }) => ({
        submissionIntegrations: submissionIntegrations || [],
      })}
      getMutationVariables={(values) => {
        const emails: SubmissionEmailMutation[] =
          values.submissionIntegrations.map((email) => ({
            id: email?.id,
            submission_email: email.submissionEmail,
            default_email: email.defaultEmail,
            team_id: teamId,
          }));

        return { emails };
      }}
      validationSchema={validationSchema}
      legend="Submission Emails"
      description={
        <>
          <Typography variant="body2">
            Add submission emails to the list. You can assign one default email
            per service. Newly added emails will be saved when you click "Save."
          </Typography>
        </>
      }
      showActionButtons={false}
    >
      {({ formik }) => (
        <>
          <Typography variant="h6" style={{ marginBottom: "1rem" }}>
            Submission Emails
          </Typography>
          <EmailsTable />
        </>
      )}
    </SettingsFormContainer>
  );
};

{
  /* const EmailsEditor: React.FC<EditorProps<SubmissionEmailInput>> = (props) => {
  return (
    <Box width="100%" mb={2}>
      <InputRow>
        <Input
          placeholder="Email"
          format="bold"
          value={props.value.submissionEmail}
          onChange={(ev) => {
            props.onChange({
              ...props.value,
              submissionEmail: ev.target.value,
            });
          }}
          errorMessage={getIn(props.errors, "submissionEmail")}
        />
        <BasicRadio
          id={props.index.toString()}
          onChange={(event, checked) => {
            props.onChange({
              ...props.value,
              defaultEmail: checked,
            });
          }}
          label="Default"
          variant="compact"
          disabled={props.disabled}
        />
      </InputRow>
    </Box>
  );
}; */
}

export default SubmissionEmails;

import Box from "@mui/material/Box";
import RadioGroup from "@mui/material/RadioGroup";
import Typography from "@mui/material/Typography";
import BasicRadio from "@planx/components/shared/Radio/BasicRadio/BasicRadio";
import { getIn } from "formik";
import { FormikHelpers } from "formik";
import { FormikProps } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import ListManager from "ui/editor/ListManager/ListManager";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import { EditorProps } from "../../../../../../../../src/ui/editor/ListManager/ListManager";
import SettingsFormContainer from "../../../shared/SettingsForm";
import {
  GET_TEAM_SUBMISSION_INTEGRATIONS,
  UPSERT_TEAM_SUBMISSION_INTEGRATIONS,
} from "./queries";
import { defaultValues, validationSchema } from "./schema";
import {
  GetTeamSubmissionIntegrationsData,
  SubmissionEmail,
  SubmissionEmailFormValues,
  SubmissionEmailMutation,
  UpdateTeamSubmissionIntegrationsVariables,
} from "./types";

export const SubmissionEmails: React.FC = () => {
  const teamId = useStore((state) => state.teamId);

  return (
    <SettingsFormContainer<
      GetTeamSubmissionIntegrationsData,
      UpdateTeamSubmissionIntegrationsVariables,
      SubmissionEmailFormValues
    >
      query={GET_TEAM_SUBMISSION_INTEGRATIONS}
      defaultValues={defaultValues}
      queryVariables={{ teamId }}
      mutation={UPSERT_TEAM_SUBMISSION_INTEGRATIONS}
      getInitialValues={({ submissionIntegrations }) => ({
        input: [],
        saved: submissionIntegrations || [],
      })}
      getMutationVariables={(values) => {
        const emails: SubmissionEmailMutation[] = values.input.map((email) => ({
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
      children={({
        formik,
      }: {
        formik: FormikProps<SubmissionEmailFormValues>;
      }) => (
        <>
          <Typography variant="h6" style={{ marginBottom: "1rem" }}>
            Submission Emails
          </Typography>
          <RadioGroup
            value={formik.values.saved.findIndex(
              (emailObj) => emailObj.defaultEmail,
            )}
            onChange={(e) => {
              const selectedIndex = parseInt(
                (e.target as HTMLInputElement).value,
                10,
              );
              formik.setFieldValue(
                "saved",
                formik.values.saved.map((emailObj, index) => ({
                  ...emailObj,
                  defaultEmail: index === selectedIndex,
                })),
              );
            }}
          >
            <ListManager
              values={[...formik.values.saved, ...formik.values.input]}
              onChange={(newValues) => {
                const { savedEmails, newEmails } = updateEmailLists(
                  newValues,
                  formik.values.saved,
                );

                formik.setFieldValue("saved", savedEmails);
                formik.setFieldValue("input", newEmails);
              }}
              newValue={() => ({
                submissionEmail: "",
                defaultEmail: false,
                teamId: teamId,
              })}
              Editor={EmailsEditor}
              maxItems={10}
            />
          </RadioGroup>
        </>
      )}
    />
  );
};

const updateEmailLists = (
  newValues: SubmissionEmail[],
  savedEmails: SubmissionEmail[],
): { savedEmails: SubmissionEmail[]; newEmails: SubmissionEmail[] } => {
  const updatedSavedEmails = newValues.filter((email) =>
    savedEmails.some(
      (savedEmail) => savedEmail.submissionEmail === email.submissionEmail,
    ),
  );

  const updatedNewEmails = newValues.filter(
    (email) =>
      !savedEmails.some(
        (savedEmail) => savedEmail.submissionEmail === email.submissionEmail,
      ),
  );

  return { savedEmails: updatedSavedEmails, newEmails: updatedNewEmails };
};

const EmailsEditor: React.FC<EditorProps<SubmissionEmail>> = (props) => {
  return (
    <Box width="100%">
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
};

export default SubmissionEmails;

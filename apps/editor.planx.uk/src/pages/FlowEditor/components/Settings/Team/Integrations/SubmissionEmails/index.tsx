import { useMutation } from "@apollo/client";
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
import {
  DELETE_TEAM_SUBMISSION_INTEGRATIONS,
  GET_TEAM_SUBMISSION_INTEGRATIONS,
  UPSERT_TEAM_SUBMISSION_INTEGRATIONS,
} from "./queries";
import { defaultValues, validationSchema } from "./schema";
import {
  DeleteSubmissionIntegrationsVariables,
  GetSubmissionEmails,
  SubmissionEmailFormValues,
  SubmissionEmailInput,
  SubmissionEmailMutation,
  UpdateTeamSubmissionIntegrationsVariables,
} from "./types";

export const SubmissionEmails: React.FC = () => {
  const teamId = useStore((state) => state.teamId);

  const [deleteSubmissionIntegrationsMutation] = useMutation(
    DELETE_TEAM_SUBMISSION_INTEGRATIONS,
  );

  const handleDelete = async (
    values: SubmissionEmailFormValues,
    data: GetSubmissionEmails,
  ) => {
    const deletedItems = data.submissionIntegrations.filter(
      (item) => !values.submissionIntegrations.some((v) => v.id === item.id),
    );

    const emailIds = deletedItems
      .map((item) => item.id)
      .filter((id): id is string => Boolean(id));

    try {
      await deleteSubmissionIntegrationsMutation({ variables: { emailIds } });
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <SettingsFormContainer<
      GetSubmissionEmails,
      UpdateTeamSubmissionIntegrationsVariables,
      SubmissionEmailFormValues
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
      onDelete={handleDelete}
    >
      {({ formik }) => {
        return (
          <>
            <Typography variant="h6" style={{ marginBottom: "1rem" }}>
              Submission Emails
            </Typography>
            <RadioGroup
              value={getDefaultRadioIndex(formik.values.submissionIntegrations)}
              onChange={(e) => {
                const selectedIndex = parseInt(
                  (e.target as HTMLInputElement).value,
                  10,
                );
                formik.setFieldValue(
                  "submissionIntegrations",
                  formik.values.submissionIntegrations.map(
                    (emailObj, index) => ({
                      ...emailObj,
                      defaultEmail: index === selectedIndex,
                    }),
                  ),
                );
              }}
            >
              <ListManager<SubmissionEmailInput, {}>
                values={formik.values.submissionIntegrations}
                errors={formik.errors.submissionIntegrations}
                onChange={(newValues) => {
                  formik.setFieldValue("submissionIntegrations", newValues);
                }}
                newValue={() => ({
                  submissionEmail: "",
                  defaultEmail: false,
                  teamId: teamId,
                })}
                Editor={EmailsEditor}
                noDragAndDrop={true}
              />
            </RadioGroup>
          </>
        );
      }}
    </SettingsFormContainer>
  );
};

const getDefaultRadioIndex = (
  submissionIntegrations: SubmissionEmailInput[],
) => {
  const defaultIndex = submissionIntegrations.findIndex(
    (emailObj) => emailObj.defaultEmail,
  );
  return defaultIndex !== -1 ? defaultIndex : 0;
};

const EmailsEditor: React.FC<EditorProps<SubmissionEmailInput>> = (props) => {
  return (
    <Box width="100%" mb={2}>
      <InputRow>
        <Input
          placeholder="Email"
          format="bold"
          value={props.value.submissionEmail}
          onChange={(ev: React.ChangeEvent<HTMLInputElement>) => {
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

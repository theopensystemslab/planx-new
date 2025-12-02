// import DeleteIcon from "@mui/icons-material/Delete";
// import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import RadioGroup from "@mui/material/RadioGroup";
import Typography from "@mui/material/Typography";
import BasicRadio from "@planx/components/shared/Radio/BasicRadio/BasicRadio";
// import BasicRadio from "@planx/components/shared/Radio/BasicRadio/BasicRadio";
import { getIn, useFormik } from "formik";
import { FormikHelpers } from "formik";
import { FormikProps } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import ListManager from "ui/editor/ListManager/ListManager";
// import InputLabel from "ui/editor/InputLabel";
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
  SubmissionEmailFormValues,
  SubmissionEmailInputValues,
  SubmissionEmailSavedValues,
  UpdateTeamSubmissionIntegrationsVariables,
} from "./types";

export const SubmissionEmails: React.FC = () => {
  const teamId = useStore((state) => state.teamId);

  const addEmail = (
    formik: ReturnType<typeof useFormik<SubmissionEmailFormValues>>,
  ) => {
    const newEmail = formik.values.input.submissionEmail.trim();
    if (
      newEmail &&
      !formik.values.saved.existingEmails.some(
        (emailObj) => emailObj.submissionEmail === newEmail,
      )
    ) {
      formik.setFieldValue("saved.existingEmails", [
        ...formik.values.saved.existingEmails,
        { submissionEmail: newEmail, defaultEmail: false },
      ]);
      formik.setFieldValue("input.submissionEmail", "");
    }
  };

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
        input: {
          submissionEmail: "",
          defaultEmail: false,
        },
        saved: {
          existingEmails: submissionIntegrations || [],
        },
      })}
      getMutationVariables={(values, data) => {
        console.log("getMutationVariables called with values:", values);
        console.log("getMutationVariables called with data:", data);
        return {
          teamId,
          emails: values.saved.existingEmails.map((emailObj) => ({
            submissionEmail: emailObj.submissionEmail,
            defaultEmail: emailObj.defaultEmail,
          })),
        };
      }}
      validationSchema={validationSchema}
      legend="Submission information"
      description={
        <>
          <Typography variant="body2">
            Enter a single email address to add it to the list of submission
            emails. You can assign one email address per service. A default
            address must be selected, which will be used as a fallback for all
            applications.
          </Typography>
        </>
      }
      onSuccess={(
        data: GetTeamSubmissionIntegrationsData | undefined,
        formik: FormikHelpers<SubmissionEmailFormValues>,
        values: SubmissionEmailFormValues,
      ) => {
        formik.resetForm();
        formik.setFieldValue(
          "saved.existingEmails",
          data?.submissionIntegrations || [],
        );
      }}
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
            value={formik.values.saved.existingEmails.findIndex(
              (emailObj) => emailObj.defaultEmail,
            )}
            onChange={(e) => {
              const selectedIndex = parseInt(
                (e.target as HTMLInputElement).value,
                10,
              );
              formik.setFieldValue(
                "saved.existingEmails",
                formik.values.saved.existingEmails.map((emailObj, index) => ({
                  ...emailObj,
                  defaultEmail: index === selectedIndex,
                })),
              );
            }}
          >
            <ListManager
              values={formik.values.saved.existingEmails}
              onChange={(newValues) =>
                formik.setFieldValue("saved.existingEmails", newValues)
              }
              newValue={() => ({ submissionEmail: "", defaultEmail: false })}
              Editor={EmailsEditor}
              maxItems={10}
            />
          </RadioGroup>
        </>
      )}
    />
  );
};

const EmailsEditor: React.FC<EditorProps<SubmissionEmailInputValues>> = (
  props,
) => {
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

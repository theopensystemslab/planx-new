import { useMutation } from "@apollo/client/react";
import DeleteIcon from "@mui/icons-material/Delete";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import ListItemText from "@mui/material/ListItemText";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import SettingsFormContainer from "../../../shared/SettingsForm";
import {
  DELETE_TEAM_SUBMISSION_INTEGRATIONS,
  GET_TEAM_SUBMISSION_INTEGRATIONS,
  UPSERT_TEAM_SUBMISSION_INTEGRATIONS,
} from "./queries";
import { defaultValues, validationSchema } from "./schema";
import {
  GetTeamSubmissionIntegrationsData,
  SubmissionEmailFormValues,
  UpdateTeamSubmissionIntegrationsVariables,
} from "./types";

export const SubmissionEmails: React.FC = () => {
  const teamId = useStore((state) => state.teamId);

  const [
    deleteSubmissionIntegration,
    { loading: deleteLoading, error: deleteError },
  ] = useMutation(DELETE_TEAM_SUBMISSION_INTEGRATIONS, {
    refetchQueries: [
      { query: GET_TEAM_SUBMISSION_INTEGRATIONS, variables: { teamId } },
    ],
    onError: (error) => {
      console.error("Delete error:", error);
    },
  });

  return (
    <SettingsFormContainer<
      GetTeamSubmissionIntegrationsData,
      SubmissionEmailFormValues,
      UpdateTeamSubmissionIntegrationsVariables
    >
      query={GET_TEAM_SUBMISSION_INTEGRATIONS}
      defaultValues={defaultValues}
      queryVariables={{ teamId }}
      mutation={UPSERT_TEAM_SUBMISSION_INTEGRATIONS}
      getInitialValues={({ submissionIntegrations }) => ({
        submissionEmail: "",
        defaultEmail: false,
        existingEmails: submissionIntegrations || [],
      })}
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
            Enter a single email address to add it to the list of submission
            emails. You can assign one email address per service. A default
            address must be selected, which will be used as a fallback for all
            applications.
          </Typography>
        </>
      }
      onSuccess={(formik, data) => {
        formik.resetForm();
        formik.setFieldValue(
          "existingEmails",
          data?.submissionIntegrations || [],
        );
      }}
    >
      {({ formik, data }) => (
        <>
          <Typography variant="h6" style={{ marginBottom: "1rem" }}>
            Submission Emails
          </Typography>

          <List>
            {data?.submissionIntegrations?.map((emailObj, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={emailObj.submissionEmail}
                  secondary={emailObj.defaultEmail ? "Default Email" : ""}
                />
                <ListItemSecondaryAction>
                  {!emailObj.defaultEmail && (
                    <IconButton
                      edge="end"
                      disabled={deleteLoading}
                      onClick={async () => {
                        try {
                          await deleteSubmissionIntegration({
                            variables: {
                              submissionEmail: emailObj.submissionEmail,
                              teamId,
                            },
                          });
                        } catch (err) {
                          console.error(
                            "Failed to delete submission email:",
                            err,
                          );
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginTop: "1rem",
            }}
          >
            <TextField
              label="New Email"
              name="submissionEmail"
              value={formik.values.submissionEmail}
              onChange={formik.handleChange}
              placeholder="Enter email address"
              fullWidth
            />
            <Checkbox
              name="defaultEmail"
              checked={formik.values.defaultEmail}
              onChange={formik.handleChange}
            />
            <Typography>Default</Typography>
          </div>
        </>
      )}
    </SettingsFormContainer>
  );
};

export default SubmissionEmails;

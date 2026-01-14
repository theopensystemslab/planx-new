import { useMutation } from "@apollo/client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { Formik } from "formik";
import { useToast } from "hooks/useToast";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";

import { upsertEmailSchema } from "./formSchema";
import {
  GET_TEAM_SUBMISSION_INTEGRATIONS,
  UPSERT_TEAM_SUBMISSION_INTEGRATIONS,
} from "./queries";
import { EditorModalProps } from "./types";

export const EmailsUpsertModal = ({
  setShowModal,
  showModal,
  initialValues,
  actionType,
  previousDefaultEmail,
  currentEmails,
}: EditorModalProps) => {
  const teamId = useStore((state) => state.teamId);
  const toast = useToast();

  const [upsertEmail] = useMutation(UPSERT_TEAM_SUBMISSION_INTEGRATIONS);

  return (
    <Formik
      initialValues={{
        submissionEmail: initialValues?.submissionEmail || "",
        defaultEmail: initialValues?.defaultEmail || false,
        teamId: teamId,
      }}
      validationSchema={upsertEmailSchema(
        currentEmails || [],
        initialValues?.submissionEmail,
      )}
      onSubmit={async (values) => {
        const variables = {
          emails: [
            {
              id: initialValues?.id,
              submission_email: values.submissionEmail,
              default_email: values.defaultEmail,
              team_id: teamId,
            },
          ],
        };

        await upsertEmail({
          variables,
          refetchQueries: [
            {
              query: GET_TEAM_SUBMISSION_INTEGRATIONS,
              variables: { teamId },
            },
          ],
        });

        if (
          values.defaultEmail &&
          previousDefaultEmail &&
          previousDefaultEmail.id !== initialValues?.id
        ) {
          await upsertEmail({
            variables: {
              emails: [
                {
                  id: previousDefaultEmail.id,
                  submission_email: previousDefaultEmail.submissionEmail,
                  default_email: false,
                  team_id: teamId,
                },
              ],
            },
            refetchQueries: [
              {
                query: GET_TEAM_SUBMISSION_INTEGRATIONS,
                variables: { teamId },
              },
            ],
          });
        }

        toast.success(
          `Successfully ${actionType === "add" ? "added" : "updated"} email`,
        );
        setShowModal(false);
      }}
    >
      {({
        handleSubmit,
        getFieldProps,
        values,
        setFieldValue,
        dirty,
        errors,
        touched,
      }) => (
        <Dialog open={showModal || false} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {actionType === "add" ? "Add Email" : "Edit Email"}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ErrorWrapper
                  id="submissionEmail"
                  error={
                    touched.submissionEmail && errors.submissionEmail
                      ? errors.submissionEmail
                      : undefined
                  }
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography>Email</Typography>
                    <Input {...getFieldProps("submissionEmail")} />
                  </Box>
                </ErrorWrapper>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  marginTop: 2,
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography>Set as Default</Typography>
                <Checkbox
                  checked={values.defaultEmail}
                  onChange={(e) =>
                    setFieldValue("defaultEmail", e.target.checked)
                  }
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowModal(false)}>Cancel</Button>
              <Button
                variant="contained"
                type="submit"
                disabled={
                  !dirty ||
                  (touched.submissionEmail && !!errors.submissionEmail)
                }
              >
                {actionType === "add" ? "Add" : "Update"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}
    </Formik>
  );
};

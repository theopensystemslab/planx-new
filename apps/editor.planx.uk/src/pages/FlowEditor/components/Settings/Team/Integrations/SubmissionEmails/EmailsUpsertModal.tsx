import { MutationFunction } from "@apollo/client/react/types/types";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import { useToast } from "hooks/useToast";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import Input from "ui/shared/Input/Input";

import { upsertEmailSchema } from "./formSchema";
import { GET_TEAM_SUBMISSION_INTEGRATIONS } from "./queries";
import { EditorModalProps } from "./types";
import { SubmissionEmailInput } from "./types";

export const EmailsUpsertModal = ({
  setShowModal,
  showModal,
  initialValues,
  actionType,
  upsertEmail,
  previousDefaultEmail,
}: EditorModalProps & { upsertEmail: MutationFunction }) => {
  const teamId = useStore((state) => state.teamId);
  const toast = useToast();

  const formik = useFormik<SubmissionEmailInput>({
    initialValues: {
      submissionEmail: initialValues?.submissionEmail || "",
      defaultEmail: initialValues?.defaultEmail || false,
      teamId: teamId,
    },
    validationSchema: upsertEmailSchema,
    validateOnMount: true,
    onSubmit: async (values) => {
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
    },
  });

  const isUpdateDisabled =
    previousDefaultEmail?.id === initialValues?.id &&
    !formik.values.defaultEmail;

  return (
    <Dialog open={showModal || false} onClose={() => setShowModal(false)}>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>
          {actionType === "add" ? "Add Email" : "Edit Email"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography>Email</Typography>
            <Input {...formik.getFieldProps("submissionEmail")} />
          </Box>
          <Box
            sx={{ display: "flex", marginTop: 2, alignItems: "center", gap: 1 }}
          >
            <Typography>Set as Default</Typography>
            <Checkbox
              checked={formik.values.defaultEmail}
              onChange={(e) =>
                formik.setFieldValue("defaultEmail", e.target.checked)
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button
            variant="contained"
            type="submit"
            disabled={!formik.isValid || !formik.dirty || isUpdateDisabled}
          >
            {actionType === "add" ? "Add" : "Update"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

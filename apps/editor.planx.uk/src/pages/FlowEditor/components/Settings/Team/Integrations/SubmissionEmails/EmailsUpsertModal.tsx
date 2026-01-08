import { MutationFunction } from "@apollo/client/react/types/types";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useFormik } from "formik";
import { useToast } from "hooks/useToast";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import InputLabel from "ui/editor/InputLabel";
import Input from "ui/shared/Input/Input";

import { upsertEmailSchema } from "./formSchema";
import { GET_TEAM_SUBMISSION_INTEGRATIONS } from "./queries";
import { EditorModalProps } from "./types";
import { SubmissionEmailInput } from "./types";

export const DEMO_TEAM_ID = 32;

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

  return (
    <Dialog open={showModal || false} onClose={() => setShowModal(false)}>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>
          {actionType === "add" ? "Add Email" : "Edit Email"}
        </DialogTitle>
        <DialogContent>
          <InputLabel label="Email">
            <Input {...formik.getFieldProps("submissionEmail")} />
          </InputLabel>
          <InputLabel label="Set as Default">
            <Checkbox
              checked={formik.values.defaultEmail}
              onChange={(e) =>
                formik.setFieldValue("defaultEmail", e.target.checked)
              }
            />
          </InputLabel>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button
            variant="contained"
            type="submit"
            disabled={!formik.isValid || !formik.dirty}
          >
            {actionType === "add" ? "Add" : "Update"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

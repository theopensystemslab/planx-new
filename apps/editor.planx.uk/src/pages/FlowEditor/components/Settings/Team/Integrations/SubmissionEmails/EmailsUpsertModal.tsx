import { MutationFunction } from "@apollo/client/react/types/types";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { FormikHelpers, useFormik } from "formik";
import { useToast } from "hooks/useToast";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
import InputGroup from "ui/editor/InputGroup";
import InputLabel from "ui/editor/InputLabel";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";

import {
  AddNewEditorFormValues,
  EditorModalProps,
} from "../../../../Team/types";
import { upsertEmailSchema } from "./formSchema";
import {
  GET_TEAM_SUBMISSION_INTEGRATIONS,
  UPSERT_TEAM_SUBMISSION_INTEGRATIONS,
} from "./queries";
import { SubmissionEmailInput } from "./types";

export const DEMO_TEAM_ID = 32;

export const EmailsUpsertModal = ({
  setShowModal,
  showModal,
  initialValues,
  actionType,
  upsertEmail,
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button type="submit" disabled={!formik.isValid}>
            {actionType === "add" ? "Add" : "Update"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

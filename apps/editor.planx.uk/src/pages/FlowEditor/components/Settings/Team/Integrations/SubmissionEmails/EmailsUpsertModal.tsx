import { useMutation } from "@apollo/client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Formik } from "formik";
import { useToast } from "hooks/useToast";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";
import { Switch } from "ui/shared/Switch";

import { upsertEmailSchema } from "./formSchema";
import {
  GET_TEAM_SUBMISSION_EMAILS,
  UPSERT_TEAM_SUBMISSION_EMAILS,
} from "./queries";
import { EditorModalProps } from "./types";

export const EmailsUpsertModal = ({
  modalState,
  setModalState,
  currentEmails,
  refetch,
}: EditorModalProps) => {
  const teamId = useStore((state) => state.teamId);
  const toast = useToast();
  const [upsertEmail] = useMutation(UPSERT_TEAM_SUBMISSION_EMAILS);

  if (!modalState || modalState.type !== "upsert") {
    throw new Error("RemoveEmailModal requires an upsert modalState");
  }

  const isFirstEmail = !currentEmails || currentEmails.length === 0;
  const isDefaultEmail =
    isFirstEmail || modalState?.email?.isDefault || false;

  return (
    <Formik
      initialValues={{
        address: modalState?.email?.address || "",
        isDefault: isDefaultEmail,
        teamId: teamId,
      }}
      validationSchema={upsertEmailSchema(
        currentEmails || [],
        modalState?.email?.address,
      )}
      onSubmit={async (values) => {
        const variables = {
          emails: [
            {
              id: modalState?.email?.id,
              address: values.address,
              is_default: values.isDefault,
              team_id: teamId,
            },
          ],
        };
        console.log({variables})
        await upsertEmail({
          variables,
          refetchQueries: [
            {
              query: GET_TEAM_SUBMISSION_EMAILS,
              variables: { teamId },
            },
          ],
        });

        toast.success(
          `Successfully ${modalState.actionType === "add" ? "added" : "updated"} email`,
        );
        refetch();
        setModalState(null);
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
        <Dialog open={true} onClose={() => setModalState(null)}>
          <form onSubmit={handleSubmit}>
            <DialogTitle variant="h3" component="h1">
              {modalState.actionType === "add" ? "Add Email" : "Edit Email"}
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ErrorWrapper
                  id="address"
                  error={
                    touched.address && errors.address
                      ? errors.address
                      : undefined
                  }
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Input {...getFieldProps("address")} />
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
                <Switch
                  name="isDefault"
                  checked={values.isDefault}
                  onChange={(e) =>
                    setFieldValue("isDefault", e.target.checked)
                  }
                  label={"Default email"}
                  disabled={isFirstEmail || isDefaultEmail}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setModalState(null)}
                color="secondary"
                variant="contained"
                sx={{ backgroundColor: "background.default" }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                type="submit"
                disabled={
                  !dirty ||
                  (touched.address && !!errors.address)
                }
              >
                {modalState.actionType === "add" ? "Add" : "Update"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}
    </Formik>
  );
};

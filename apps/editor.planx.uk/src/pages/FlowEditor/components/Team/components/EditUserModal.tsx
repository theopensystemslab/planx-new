import { useMutation } from "@apollo/client";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { TeamRole } from "@opensystemslab/planx-core/types";
import { Form, Formik } from "formik";
import { useToast } from "hooks/useToast";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { Switch } from "ui/shared/Switch";

import { upsertMemberSchema } from "../formSchema";
import { GET_USERS_FOR_TEAM_QUERY, UPDATE_TEAM_MEMBER } from "../queries";
import { type EditUserModalProps, type UserFormValues } from "../types";
import { EmailField } from "./Fields/EmailField";
import { NameFields } from "./Fields/NameFields";
import { ModalActions } from "./ModalActions";

export const EditUserModal: React.FC<EditUserModalProps> = ({
  onClose,
  member,
  showTeamAdminSwitch,
}) => {
  const toast = useToast();
  const teamId = useStore((state) => state.teamId);

  const handleCompleted = (successMessage: string) => {
    onClose();
    toast.success(successMessage);
  };

  const [updateUser, { loading }] = useMutation(UPDATE_TEAM_MEMBER, {
    refetchQueries: [
      {
        query: GET_USERS_FOR_TEAM_QUERY,
        variables: { teamSlug: useStore.getState().teamSlug },
      },
    ],
    onCompleted: () => handleCompleted("Successfully updated a user"),
    onError: () => toast.error("Failed to update the user, please try again"),
  });

  const handleSubmit = (values: UserFormValues) => {
    const formatted = { ...values, email: values.email.toLowerCase() };

    updateUser({
      variables: {
        userId: member.id,
        teamId: teamId,
        role: values.role,
        userValues: {
          first_name: formatted.firstName,
          last_name: formatted.lastName,
          email: formatted.email,
        },
      },
    });
  };

  return (
    <Dialog
      aria-labelledby="dialog-heading"
      data-testid="dialog-edit-user"
      open
      onClose={onClose}
    >
      <Formik<UserFormValues>
        initialValues={{
          firstName: member.firstName,
          lastName: member.lastName,
          email: member?.email ?? "",
          role: member.role as TeamRole,
        }}
        validationSchema={upsertMemberSchema}
        onSubmit={handleSubmit}
        enableReinitialize
        validateOnBlur={false}
        validateOnChange={false}
      >
        {(formik) => (
          <Form>
            <DialogTitle variant="h3" component="h1" id="dialog-heading">
              Edit member
            </DialogTitle>
            <DialogContent dividers data-testid="modal-edit-user">
              <EmailField />
              <Box sx={{ mt: 2, mb: 2 }}>
                <NameFields />
              </Box>
              {showTeamAdminSwitch && (
                <Switch
                  name="role"
                  checked={formik.values.role === "teamAdmin"}
                  onChange={() =>
                    formik.setFieldValue(
                      "role",
                      formik.values.role === "teamEditor"
                        ? "teamAdmin"
                        : "teamEditor",
                    )
                  }
                  label={"Team Admin"}
                />
              )}
            </DialogContent>
            <DialogActions>
              <ModalActions
                submitButtonText="Update user"
                submitDataTestId="modal-edit-user-button"
                isSubmitting={loading}
                onCancel={onClose}
              />
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

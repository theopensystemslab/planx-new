import { useMutation } from "@apollo/client";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { TeamRole } from "@opensystemslab/planx-core/types";
import { Form, Formik } from "formik";
import { useToast } from "hooks/useToast";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import SelectInput from "ui/shared/SelectInput/SelectInput";

import { upsertMemberSchema } from "../formSchema";
import {
  CREATE_TEAM_ADMIN_ONLY,
  GET_USERS_FOR_TEAM_QUERY,
  REMOVE_TEAM_ADMIN_ONLY,
  UPDATE_USER_ONLY,
} from "../queries";
import { type EditUserModalProps, type UserFormValues } from "../types";
import { roleOptions } from "./AddUserModal";
import { EmailField } from "./Fields/EmailField";
import { NameFields } from "./Fields/NameFields";
import { ModalActions } from "./ModalActions";

export const EditUserModal: React.FC<EditUserModalProps> = ({
  onClose,
  member,
}) => {
  const toast = useToast();
  const teamId = useStore((state) => state.teamId);
  const isPlatformAdmin = member.role === "platformAdmin";

  const handleCompleted = (successMessage: string) => {
    onClose();
    toast.success(successMessage);
  };

  const [updateUserOnly, { loading: loadingUser }] = useMutation(
    UPDATE_USER_ONLY,
    {
      refetchQueries: [
        {
          query: GET_USERS_FOR_TEAM_QUERY,
          variables: { teamSlug: useStore.getState().teamSlug },
        },
      ],
      onCompleted: () => handleCompleted("Successfully updated a user"),
      onError: () => toast.error("Failed to update the user, please try again"),
    },
  );

  const [createTeamAdmin, { loading: loadingCreateTeamAdmin }] = useMutation(
    CREATE_TEAM_ADMIN_ONLY,
    {
      refetchQueries: [
        {
          query: GET_USERS_FOR_TEAM_QUERY,
          variables: { teamSlug: useStore.getState().teamSlug },
        },
      ],
      onCompleted: () => handleCompleted("Successfully updated a user"),
      onError: () => toast.error("Failed to update the user, please try again"),
    },
  );

  const [removeTeamAdmin, { loading: loadingRemoveTeamAdmin }] = useMutation(
    REMOVE_TEAM_ADMIN_ONLY,
    {
      refetchQueries: [
        {
          query: GET_USERS_FOR_TEAM_QUERY,
          variables: { teamSlug: useStore.getState().teamSlug },
        },
      ],
      onCompleted: (data) => {
        if (data.delete_team_members.affected_rows > 0) {
          handleCompleted("Successfully updated a user");
        } else {
          toast.warning("No admin role found to remove");
        }
      },
      onError: () => toast.error("Failed to update the user, please try again"),
    },
  );

  const handleSubmit = async (values: UserFormValues) => {
    const formatted = { ...values, email: values.email.toLowerCase() };

    const userInfoChanged =
      formatted.firstName !== member.firstName ||
      formatted.lastName !== member.lastName ||
      formatted.email !== (member.email ?? "").toLowerCase();

    const roleChanged = values.role !== member.role;

    if (userInfoChanged) {
      await updateUserOnly({
        variables: {
          userId: member.id,
          userValues: {
            first_name: formatted.firstName,
            last_name: formatted.lastName,
            email: formatted.email,
          },
        },
      });
    }

    if (roleChanged) {
      if (values.role === "teamAdmin") {
        await createTeamAdmin({
          variables: { userId: member.id, teamId },
        });
      } else {
        await removeTeamAdmin({
          variables: { userId: member.id, teamId },
        });
      }
    }
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
              {!isPlatformAdmin && (
                <>
                  <Typography sx={{ pb: 0.5 }} variant="body2">
                    Role
                  </Typography>
                  <SelectInput
                    value={formik.values.role}
                    name="role"
                    bordered
                    required
                    title={"User role"}
                    data-testid="user-role-select"
                    labelId="user-role-select"
                    onChange={() =>
                      formik.setFieldValue(
                        "role",
                        formik.values.role === roleOptions[0].id
                          ? roleOptions[1].id
                          : roleOptions[0].id,
                      )
                    }
                  >
                    {roleOptions.map(({ id, name }) => (
                      <MenuItem
                        key={id}
                        value={id}
                        data-testid={`${id}-option`}
                      >
                        {name}
                      </MenuItem>
                    ))}
                  </SelectInput>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <ModalActions
                submitButtonText="Update user"
                submitDataTestId="modal-edit-user-button"
                isSubmitting={
                  loadingUser ||
                  loadingCreateTeamAdmin ||
                  loadingRemoveTeamAdmin
                }
                onCancel={onClose}
              />
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

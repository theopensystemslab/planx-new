import { useMutation } from "@apollo/client";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Form, Formik } from "formik";
import { useToast } from "hooks/useToast";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import { upsertMemberSchema } from "../formSchema";
import { UPDATE_TEAM_MEMBER } from "../queries";
import { DEMO_TEAM_ID, EditorModalProps,UserFormValues } from "../types";
import { MemberFields } from "./MemberFields";
import { ModalActions } from "./ModalActions";

type Props = Extract<EditorModalProps, { action: "edit" }>;

export const EditUserModal: React.FC<Props> = ({
  onClose,
  member,
}) => {
  const teamId = useStore((state) => state.teamId);
  const isDemoTeam = teamId === DEMO_TEAM_ID;
  const toast = useToast();

  const handleCompleted = (successMessage: string) => {
    onClose();
    toast.success(successMessage);
  };

  const [updateUser, { loading }] =
    useMutation(UPDATE_TEAM_MEMBER, {
      onCompleted: () => handleCompleted("Successfully updated a user"),
      onError: () => 
        toast.error("Failed to update the user, please try again")
    });

  const handleSubmit = (values: UserFormValues) => {
    const formatted = { ...values, email: values.email.toLowerCase() };

    updateUser({
      variables: {
        userId: member.id,
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
          role: isDemoTeam ? "demoUser" : "teamEditor",
        }}
        validationSchema={upsertMemberSchema}
        onSubmit={handleSubmit}
        enableReinitialize
        validateOnBlur={false}
        validateOnChange={false}
      >
        <Form>
          <DialogTitle variant="h3" component="h1" id="dialog-heading">
            Edit member
          </DialogTitle>
          <DialogContent
            dividers
            data-testid="modal-edit-user"
          >
            <MemberFields mode={"edit"}/>
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
      </Formik>
    </Dialog>
  );
};

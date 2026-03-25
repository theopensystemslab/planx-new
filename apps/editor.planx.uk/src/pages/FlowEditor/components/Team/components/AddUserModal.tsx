import { useMutation } from "@apollo/client";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Form, Formik } from "formik";
import { useToast } from "hooks/useToast";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import {
  AddNewMemberErrors,
  isUserAlreadyExistsError,
} from "../errors/addNewEditorErrors";
import { upsertMemberSchema } from "../formSchema";
import {
  CREATE_AND_ADD_USER_TO_TEAM,
  GET_USERS_FOR_TEAM_QUERY,
} from "../queries";
import { DEMO_TEAM_ID, EditorModalProps,UserFormValues } from "../types";
import { MemberFields } from "./MemberFields";
import { ModalActions } from "./ModalActions";

type Props = Extract<EditorModalProps, { action: "add" }>;

export const AddUserModal: React.FC<Props> = ({
  setShowModal,
  showModal,
}) => {
  const [teamId, teamSlug] = useStore((state) => [
    state.teamId,
    state.teamSlug,
  ]);
  const isDemoTeam = teamId === DEMO_TEAM_ID;
  const toast = useToast();

  const handleCompleted = (successMessage: string) => {
    setShowModal(false);
    toast.success(successMessage);
  };

  const [createUser, { loading, error }] =
    useMutation(CREATE_AND_ADD_USER_TO_TEAM, {
      onCompleted: () => handleCompleted("Successfully added a user"),
      onError: (err) => {
        if (!isUserAlreadyExistsError(err.message)) {
          toast.error("Failed to add new user, please try again");
        }
      },
      refetchQueries: [
        { query: GET_USERS_FOR_TEAM_QUERY, variables: { teamSlug } },
      ],
    });

  const showUserAlreadyExistsError =
    !!error && isUserAlreadyExistsError(error.message);

  const handleSubmit = (values: UserFormValues) => {
    const formatted = { ...values, email: values.email.toLowerCase() };

      createUser({
        variables: {
          ...formatted,
          teamId,
          role: isDemoTeam ? "demoUser" : "teamEditor",
        },
      });
  };

  return (
    <Dialog
      aria-labelledby="dialog-heading"
      data-testid="dialog-add-user"
      open={showModal || false}
      onClose={() => setShowModal(false)}
    >
      <Formik<UserFormValues>
        initialValues={{
          firstName: "",
          lastName: "",
          email: "",
          role: isDemoTeam ? "demoUser" : "teamEditor",
        }}
        validationSchema={upsertMemberSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        <Form>
          <DialogTitle variant="h3" component="h1" id="dialog-heading">
            Add a new member
          </DialogTitle>
          <DialogContent
            dividers
            data-testid="modal-create-user"
          >
            <MemberFields />
          </DialogContent>
          <DialogActions>
            <ErrorWrapper
              error={
                showUserAlreadyExistsError
                  ? AddNewMemberErrors.USER_ALREADY_EXISTS.errorMessage
                  : undefined
              }
            >
              <ModalActions
                submitButtonText="Create user"
                submitDataTestId="modal-create-user-button"
                isSubmitting={loading}
                onCancel={() => setShowModal(false)}
              />
            </ErrorWrapper>
          </DialogActions>
        </Form>
      </Formik>
    </Dialog>
  );
};

import { useMutation } from "@apollo/client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Form, Formik, useFormikContext } from "formik";
import { useToast } from "hooks/useToast";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import InputGroup from "ui/editor/InputGroup";
import InputLabel from "ui/editor/InputLabel";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";

import {
  AddNewMemberErrors,
  isUserAlreadyExistsError,
} from "../errors/addNewEditorErrors";
import { upsertMemberSchema } from "../formSchema";
import {
  CREATE_AND_ADD_USER_TO_TEAM,
  GET_USERS_FOR_TEAM_QUERY,
  UPDATE_TEAM_MEMBER,
} from "../queries";
import { AddNewEditorFormValues, EditorModalProps } from "../types";

export const DEMO_TEAM_ID = 32;

type Props = Extract<EditorModalProps, { action: "add" } | { action: "edit" }>;

const MemberFields = () => {
  const { getFieldProps, touched, errors, values } =
    useFormikContext<AddNewEditorFormValues>();

  return (
    <InputGroup flowSpacing>
      <InputLabel label="First name" htmlFor="firstName">
        <Input
          id="firstName"
          type="text"
          {...getFieldProps("firstName")}
          errorMessage={
            touched.firstName && errors.firstName ? errors.firstName : undefined
          }
          value={values.firstName}
        />
      </InputLabel>
      <InputLabel label="Last name" htmlFor="lastName">
        <Input
          id="lastName"
          type="text"
          {...getFieldProps("lastName")}
          errorMessage={
            touched.lastName && errors.lastName ? errors.lastName : undefined
          }
          value={values.lastName}
        />
      </InputLabel>
      <InputLabel label="Email address" htmlFor="email">
        <Input
          id="email"
          type="email"
          {...getFieldProps("email")}
          errorMessage={
            touched.email && errors.email ? errors.email : undefined
          }
          value={values.email}
        />
      </InputLabel>
    </InputGroup>
  );
};

const ModalActions = ({
  action,
  isSubmitting,
  onCancel,
}: {
  action: EditorModalProps["action"];
  isSubmitting: boolean;
  onCancel: () => void;
}) => {
  const { dirty, isValid } = useFormikContext();

  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
      <Button
        variant="contained"
        color="secondary"
        type="reset"
        onClick={onCancel}
        data-testid="modal-cancel-button"
        sx={{ backgroundColor: "background.default" }}
      >
        Cancel
      </Button>
      <Button
        variant="contained"
        color="prompt"
        type="submit"
        data-testid={
          action === "add"
            ? "modal-create-user-button"
            : "modal-edit-user-button"
        }
        disabled={!dirty || !isValid || isSubmitting}
      >
        {action === "add" ? "Create user" : "Update user"}
      </Button>
    </Box>
  );
};

export const UserUpsertModal: React.FC<Props> = ({
  setShowModal,
  showModal,
  action,
  member,
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

  const [createUser, { loading: createLoading, error: createError }] =
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

  const [updateUser, { loading: updateLoading, error: updateError }] =
    useMutation(UPDATE_TEAM_MEMBER, {
      onCompleted: () => handleCompleted("Successfully updated a user"),
      onError: (err) => {
        if (!isUserAlreadyExistsError(err.message)) {
          toast.error("Failed to update the user, please try again");
        }
      },
    });

  const activeError = createError || updateError;
  const showUserAlreadyExistsError =
    !!activeError && isUserAlreadyExistsError(activeError.message);

  const handleSubmit = (values: AddNewEditorFormValues) => {
    const formatted = { ...values, email: values.email.toLowerCase() };

    if (action === "add") {
      createUser({
        variables: {
          ...formatted,
          teamId,
          role: isDemoTeam ? "demoUser" : "teamEditor",
        },
      });
    }

    if (action === "edit") {
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
    }
  };

  return (
    <Dialog
      aria-labelledby="dialog-heading"
      data-testid={`dialog-${action}-user`}
      open={showModal || false}
      onClose={() => setShowModal(false)}
    >
      <Formik<AddNewEditorFormValues>
        initialValues={{
          firstName: member?.firstName ?? "",
          lastName: member?.lastName ?? "",
          email: member?.email ?? "",
          role: isDemoTeam ? "demoUser" : "teamEditor",
        }}
        validationSchema={upsertMemberSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        <Form>
          <DialogTitle variant="h3" component="h1" id="dialog-heading">
            {action === "add" ? "Add a new member" : "Edit member"}
          </DialogTitle>
          <DialogContent
            dividers
            data-testid={
              action === "add" ? "modal-create-user" : "modal-edit-user"
            }
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
                action={action}
                isSubmitting={createLoading || updateLoading}
                onCancel={() => setShowModal(false)}
              />
            </ErrorWrapper>
          </DialogActions>
        </Form>
      </Formik>
    </Dialog>
  );
};

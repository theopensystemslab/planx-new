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
  AddNewMemberErrors,
  isUserAlreadyExistsError,
} from "../errors/addNewEditorErrors";
import { upsertMemberSchema } from "../formSchema";
import { createAndAddUserToTeam } from "../queries/createAndAddUserToTeam";
import { updateTeamMember } from "../queries/updateUser";
import { AddNewEditorFormValues, EditorModalProps } from "../types";
import {
  optimisticallyAddNewMember,
  optimisticallyUpdateExistingMember,
} from "./lib/optimisticallyUpdateMembersTable";

export const DEMO_TEAM_ID = 32;

export const UserUpsertModal = ({
  setShowModal,
  showModal,
  initialValues,
  actionType,
}: EditorModalProps) => {
  const [showUserAlreadyExistsError, setShowUserAlreadyExistsError] =
    useState<boolean>(false);
  const [teamId, teamSlug] = useStore((state) => [
    state.teamId,
    state.teamSlug,
  ]);
  const isDemoTeam = teamId === DEMO_TEAM_ID;

  const toast = useToast();

  const clearErrors = () => {
    setShowUserAlreadyExistsError(false);
  };

  const handleSubmit = async (
    values: AddNewEditorFormValues,
    { resetForm }: FormikHelpers<AddNewEditorFormValues>,
  ) => {
    switch (actionType) {
      case "add":
        handleSubmitToAddNewUser();
        break;
      case "edit":
        handleSubmitToUpdateUser();
    }
    resetForm({ values });
  };

  const formatUser = (user: AddNewEditorFormValues) => ({
    ...user,
    email: user.email.toLowerCase(),
  });

  const handleSubmitToAddNewUser = async () => {
    const newUser = formatUser(formik.values);

    const createUserResult = await createAndAddUserToTeam({
      newUser,
      teamId,
      teamSlug,
    }).catch((err) => {
      if (isUserAlreadyExistsError(err.message)) {
        setShowUserAlreadyExistsError(true);
      }
      if (err.message === "Unable to create user") {
        toast.error("Failed to add new user, please try again");
      }
      console.error(err);
    });

    if (!createUserResult) {
      return;
    }
    clearErrors();
    optimisticallyAddNewMember(newUser, createUserResult.id);
    setShowModal(false);
    toast.success("Successfully added a user");
  };

  const handleSubmitToUpdateUser = async () => {
    if (!initialValues) return;

    const updatedUser = formatUser(formik.values);

    const response = await updateTeamMember(
      initialValues.id,
      updatedUser,
    ).catch((err) => {
      if (isUserAlreadyExistsError(err.message)) {
        setShowUserAlreadyExistsError(true);
      }
      if (err.message === "Unable to update user") {
        toast.error("Failed to update the user, please try again");
      }
      console.error(err);
    });

    if (!response) {
      return;
    }

    clearErrors();
    optimisticallyUpdateExistingMember(updatedUser, initialValues.id);
    setShowModal(false);
    toast.success("Successfully updated a user");
  };

  const formik = useFormik<AddNewEditorFormValues>({
    initialValues: {
      firstName: initialValues?.firstName || "",
      lastName: initialValues?.lastName || "",
      email: initialValues?.email || "",
      // Users within the Demo team are granted a role with a restricted permission set
      role: isDemoTeam ? "demoUser" : "teamEditor",
    },
    validationSchema: upsertMemberSchema,
    onSubmit: handleSubmit,
  });

  return (
    <Dialog
      aria-labelledby="dialog-heading"
      data-testid={`dialog-${actionType}-user`}
      open={showModal || false}
      onClose={() => setShowModal(false)}
    >
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle variant="h3" component="h1" id="dialog-heading">
          {actionType === "add" ? "Add a new member" : "Edit member"}
        </DialogTitle>
        <DialogContent
          dividers
          data-testid={
            actionType === "add" ? "modal-create-user" : "modal-edit-user"
          }
        >
          <InputGroup flowSpacing>
            <InputLabel label="First name" htmlFor="firstName">
              <Input
                id="firstName"
                type="text"
                {...formik.getFieldProps("firstName")}
                errorMessage={
                  formik.touched.firstName && formik.errors.firstName
                    ? formik.errors.firstName
                    : undefined
                }
                value={formik.values.firstName}
              />
            </InputLabel>
            <InputLabel label="Last name" htmlFor="lastName">
              <Input
                id="lastName"
                type="text"
                {...formik.getFieldProps("lastName")}
                errorMessage={
                  formik.touched.lastName && formik.errors.lastName
                    ? formik.errors.lastName
                    : undefined
                }
                value={formik.values.lastName}
              />
            </InputLabel>
            <InputLabel label="Email address" htmlFor="email">
              <Input
                id="email"
                type="email"
                {...formik.getFieldProps("email")}
                errorMessage={
                  formik.touched.email && formik.errors.email
                    ? formik.errors.email
                    : undefined
                }
                value={formik.values.email}
              />
            </InputLabel>
          </InputGroup>
        </DialogContent>
        <DialogActions>
          <ErrorWrapper
            error={
              showUserAlreadyExistsError
                ? AddNewMemberErrors.USER_ALREADY_EXISTS.errorMessage
                : undefined
            }
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1.5,
              }}
            >
              <Button
                variant="contained"
                color="secondary"
                type="reset"
                onClick={() => setShowModal(false)}
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
                  actionType === "add"
                    ? "modal-create-user-button"
                    : "modal-edit-user-button"
                }
                disabled={!formik.dirty || !formik.isValid}
              >
                {actionType === "add" ? "Create user" : "Update user"}
              </Button>
            </Box>
          </ErrorWrapper>
        </DialogActions>
      </form>
    </Dialog>
  );
};

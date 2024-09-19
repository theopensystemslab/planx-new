import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import { FormikHelpers, useFormik } from "formik";
import { useToast } from "hooks/useToast";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
import InputGroup from "ui/editor/InputGroup";
import InputLabel from "ui/editor/InputLabel";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input";

import {
  AddNewEditorErrors,
  isUserAlreadyExistsError,
} from "../errors/addNewEditorErrors";
import { upsertEditorSchema } from "../formSchema";
import { createAndAddUserToTeam } from "../queries/createAndAddUserToTeam";
import { updateTeamMember } from "../queries/updateUser";
import { AddNewEditorFormValues, EditorModalProps } from "../types";
import {
  optimisticallyAddNewMember,
  optimisticallyUpdateExistingMember,
} from "./lib/optimisticallyUpdateMembersTable";

export const EditorUpsertModal = ({
  setShowModal,
  initialValues,
  actionType,
}: EditorModalProps) => {
  const [showUserAlreadyExistsError, setShowUserAlreadyExistsError] =
    useState<boolean>(false);

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

  const handleSubmitToAddNewUser = async () => {
    const { teamId, teamSlug } = useStore.getState();

    const createUserResult = await createAndAddUserToTeam(
      formik.values.email,
      formik.values.firstName,
      formik.values.lastName,
      teamId,
      teamSlug,
    ).catch((err) => {
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
    optimisticallyAddNewMember(formik.values, createUserResult.id);
    setShowModal(false);
    toast.success("Successfully added a user");
  };
  const handleSubmitToUpdateUser = async () => {
    if (!initialValues) {
      return;
    }
    const response = await updateTeamMember(
      initialValues.id,
      formik.values,
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
    optimisticallyUpdateExistingMember(formik.values, initialValues.id);
    setShowModal(false);
    toast.success("Successfully updated a user");
  };

  const formik = useFormik<AddNewEditorFormValues>({
    initialValues: {
      firstName: initialValues?.firstName || "",
      lastName: initialValues?.lastName || "",
      email: initialValues?.email || "",
    },
    validationSchema: upsertEditorSchema,
    onSubmit: handleSubmit,
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <DialogContent
        data-testid={
          actionType === "add" ? "modal-create-user" : "modal-edit-user"
        }
      >
        <Box sx={{ mt: 1, mb: 4 }}>
          <Typography variant="h3" component="h2" id="dialog-heading">
            Add a new editor
          </Typography>
        </Box>
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
      <DialogActions
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          padding: 2,
        }}
      >
        <ErrorWrapper
          error={
            showUserAlreadyExistsError
              ? AddNewEditorErrors.USER_ALREADY_EXISTS.errorMessage
              : undefined
          }
        >
          <Box>
            <>
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
              <Button
                variant="contained"
                color="secondary"
                type="reset"
                sx={{ ml: 1.5 }}
                onClick={() => setShowModal(false)}
                data-testid="modal-cancel-button"
              >
                Cancel
              </Button>
            </>
          </Box>
        </ErrorWrapper>
      </DialogActions>
    </form>
  );
};

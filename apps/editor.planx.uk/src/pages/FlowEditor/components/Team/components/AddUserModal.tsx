import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { Form, Formik } from "formik";
import React from "react";
import SelectInput from "ui/shared/SelectInput/SelectInput";

import { useAddUserModal } from "../hooks/useAddUserModal";
import type { UserFormValues } from "../types";
import { type AddUserModalProps } from "../types";
import { EmailField } from "./Fields/EmailField";
import { NameFields } from "./Fields/NameFields";
import { ModalActions } from "./ModalActions";

export const roleOptions = [
  { id: "teamEditor", name: "Team editor" },
  {
    id: "teamAdmin",
    name: "Team admin",
  },
];

export const AddUserModal: React.FC<AddUserModalProps> = ({
  onClose,
  userRole,
}) => {
  const {
    step,
    title,
    handleClose,
    handleSubmit,
    submitButtonText,
    isSubmitting,
    validationSchema,
  } = useAddUserModal({ onClose, userRole });

  return (
    <Dialog
      aria-labelledby="dialog-heading"
      data-testid="dialog-add-user"
      open
      onClose={onClose}
    >
      <Formik<UserFormValues>
        initialValues={{
          firstName: "",
          lastName: "",
          email: "",
          role: "teamEditor",
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
        validateOnBlur={false}
        validateOnChange={false}
      >
        {(formik) => (
          <Form>
            <DialogTitle variant="h3" component="h1" id="dialog-heading">
              {title}
            </DialogTitle>
            <DialogContent dividers data-testid="modal-create-user">
              {step.stage === "email" && <EmailField />}
              {step.stage === "create-new" && (
                <>
                  <EmailField disabled />
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <NameFields />
                  </Box>
                  <Typography
                    component="label"
                    id="User-role-label"
                    sx={{ pb: 0.5 }}
                    variant="body2"
                  >
                    Role
                  </Typography>
                  <SelectInput
                    value={formik.values.role}
                    name="User role"
                    bordered
                    required
                    data-testid="user-role-select"
                    onChange={(e) => {
                      formik.setFieldValue("role", e.target.value);
                    }}
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
              {step.stage === "confirm-existing" && (
                <Typography>
                  An account already exists for that email address. Would you
                  like to additionally add them to this team?
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <ModalActions
                submitButtonText={submitButtonText}
                submitDataTestId="modal-create-user-button"
                isSubmitting={isSubmitting}
                onCancel={handleClose}
              />
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

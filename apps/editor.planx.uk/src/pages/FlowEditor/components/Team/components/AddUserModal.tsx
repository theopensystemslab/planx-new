import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { Form, Formik } from "formik";
import React from "react";

import { useAddUserModal } from "../hooks/useAddUserModal";
import { type AddUserModalProps, UserFormValues } from "../types";
import { EmailField } from "./Fields/EmailField";
import { NameFields } from "./Fields/NameFields";
import { ModalActions } from "./ModalActions";

export const AddUserModal: React.FC<AddUserModalProps> = ({
  onClose,
  showTeamAdminSwitch,
}) => {
  const {
    step,
    role,
    title,
    handleClose,
    handleSubmit,
    submitButtonText,
    isSubmitting,
    validationSchema,
  } = useAddUserModal({ onClose });

  return (
    <Dialog
      aria-labelledby="dialog-heading"
      data-testid="dialog-add-user"
      open
      onClose={onClose}
    >
      <Formik<UserFormValues>
        initialValues={{ firstName: "", lastName: "", email: "", role }}
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
                      label={"Is Team Admin"}
                    />
                  )}
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

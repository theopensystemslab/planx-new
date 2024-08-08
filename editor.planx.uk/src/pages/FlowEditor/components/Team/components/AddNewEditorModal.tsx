import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import React from "react";
import InputGroup from "ui/editor/InputGroup";
import InputLabel from "ui/editor/InputLabel";
import Input from "ui/shared/Input";
import * as Yup from "yup";

import { AddNewEditorModalProps } from "../types";

export const AddNewEditorModal = ({
  showModal,
  setShowModal,
}: AddNewEditorModalProps) => {
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("Required"),
      lastName: Yup.string().required("Required"),
      email: Yup.string().email("Invalid email address").required("Required"),
    }),
    onSubmit: (values) => {
      console.log({ values });
      alert(JSON.stringify(values, null, 2));
    },
  });

  return (
    <Dialog
      aria-labelledby="dialog-heading"
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: (theme) => theme.breakpoints.values.md,
          borderRadius: 0,
          borderTop: (theme) => `20px solid ${theme.palette.primary.main}`,
          background: "#FFF",
          margin: (theme) => theme.spacing(2),
        },
      }}
      open={showModal}
      onClose={() => setShowModal(false)}
    >
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
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
                errorMessage={formik.errors.firstName}
              />
            </InputLabel>
            <InputLabel label="Last name" htmlFor="lastName">
              <Input
                id="lastName"
                type="text"
                {...formik.getFieldProps("lastName")}
                errorMessage={formik.errors.lastName}
              />
            </InputLabel>
            <InputLabel label="Email address" htmlFor="email">
              <Input
                id="email"
                type="email"
                {...formik.getFieldProps("email")}
                errorMessage={formik.errors.email}
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
          <Box>
            <Button
              variant="contained"
              color="prompt"
              type="submit"
              data-testid="modal-create-user-button"
            >
              Create user
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
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

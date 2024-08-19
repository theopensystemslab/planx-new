import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import { FormikHelpers, useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import InputGroup from "ui/editor/InputGroup";
import InputLabel from "ui/editor/InputLabel";
import Input from "ui/shared/Input";

import { addNewEditorFormSchema } from "../formSchema";
import { createAndAddUserToTeam } from "../queries/createAndAddUserToTeam";
import { AddNewEditorFormValues, AddNewEditorModalProps } from "../types";
import { optimisticallyUpdateTable } from "./lib/optimisticallyUpdateTable";

export const AddNewEditorModal = ({
  showModal,
  setShowModal,
  setTableData,
  tableData,
}: AddNewEditorModalProps) => {
  const handleSubmit = async (
    values: AddNewEditorFormValues,
    { resetForm }: FormikHelpers<AddNewEditorFormValues>,
  ) => {
    const teamId = useStore.getState().teamId;

    await createAndAddUserToTeam(
      values.email,
      values.firstName,
      values.lastName,
      teamId,
    );

    optimisticallyUpdateTable(values, setTableData, tableData);
    setShowModal(false);
    resetForm({ values });
  };

  const formik = useFormik<AddNewEditorFormValues>({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
    validationSchema: addNewEditorFormSchema,
    onSubmit: handleSubmit,
  });

  return (
    <Dialog
      aria-labelledby="dialog-heading"
      PaperProps={{
        sx: (theme) => ({
          width: "100%",
          maxWidth: theme.breakpoints.values.md,
          borderRadius: 0,
          borderTop: `20px solid ${theme.palette.primary.main}`,
          background: "#FFF",
          margin: theme.spacing(2),
        }),
      }}
      open={showModal}
      onClose={() => setShowModal(false)}
    >
      <form onSubmit={formik.handleSubmit}>
        <DialogContent data-testid="modal-create-user">
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

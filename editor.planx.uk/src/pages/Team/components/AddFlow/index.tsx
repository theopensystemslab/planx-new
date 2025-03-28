import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog, { dialogClasses } from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { Form, Formik, FormikConfig } from "formik";
import React, { useState } from "react";
import { AddButton } from "ui/editor/AddButton";

import { BaseFormSection } from "./BaseFormSection";
import { CreateFromCopyFormSection } from "./CreateFromCopyFormSection";
import { CreateFromTemplateFormSection } from "./CreateFromTemplateFormSection";
import { CreateFlow } from "./types";

// TODO: Standardise or share this
export const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`& .${dialogClasses.paper}`]: {
    width: "100%",
    maxWidth: theme.breakpoints.values.md,
    borderRadius: 0,
    borderTop: `20px solid ${theme.palette.primary.main}`,
    background: theme.palette.background.paper,
    margin: theme.spacing(2),
  },
}));

export const AddFlow: React.FC = () => {
  const initialValues: CreateFlow = {
    mode: "new",
    flow: {
      slug: "",
      name: "",
      sourceId: "",
    },
  };

  // TODO: Handle flow creation across modes
  const onSubmit: FormikConfig<CreateFlow>["onSubmit"] = (values) =>
    console.log("Submit! Values: ", values);

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  return (
    <Box mt={1}>
      <AddButton onClick={() => setDialogOpen(true)}>
        Add a new service
      </AddButton>
      <Formik<CreateFlow>
        initialValues={initialValues}
        onSubmit={onSubmit}
        validateOnBlur={false}
        validateOnChange={false}
      >
        <Form id="modal" name="modal">
          <StyledDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            fullWidth
          >
            <DialogTitle variant="h3" component="h1">
              <Box sx={{ mt: 1, mb: 4 }}>
                <Typography variant="h3" component="h2" id="dialog-heading">
                  Add a new service
                </Typography>
              </Box>
            </DialogTitle>
            <Box>
              <DialogContent
                sx={{ gap: 2, display: "flex", flexDirection: "column" }}
              >
                <BaseFormSection />
                <CreateFromTemplateFormSection />
                <CreateFromCopyFormSection />
              </DialogContent>
              <DialogActions sx={{ paddingX: 2 }}>
                <Button disableRipple onClick={() => setDialogOpen(false)}>
                  Back
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  disableRipple
                >
                  Add service
                </Button>
              </DialogActions>
            </Box>
          </StyledDialog>
        </Form>
      </Formik>
    </Box>
  );
};

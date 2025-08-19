import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { isAxiosError } from "axios";
import { Form, Formik, FormikConfig } from "formik";
import React, { useState } from "react";
import { useNavigation } from "react-navi";
import { AddButton } from "ui/editor/AddButton";

import { useStore } from "../../../FlowEditor/lib/store";
import { BaseFormSection } from "./BaseFormSection";
import { CreateFlow, validationSchema } from "./types";

export const AddFlow: React.FC = () => {
  const { navigate } = useNavigation();
  const {
    teamId,
    createFlow,
    createFlowFromTemplate,
    createFlowFromCopy,
    teamSlug,
  } = useStore();

  const initialValues: CreateFlow = {
    mode: "new",
    flow: {
      slug: "",
      name: "",
      sourceId: "",
      teamId,
      isTemplate: false,
    },
  };

  const onSubmit: FormikConfig<CreateFlow>["onSubmit"] = async (
    { mode, flow },
    { setFieldError },
  ) => {
    try {
      switch (mode) {
        case "new":
          await createFlow(flow);
          break;
        case "copy":
          await createFlowFromCopy(flow);
          break;
        case "template":
          await createFlowFromTemplate(flow);
          break;
      }

      navigate(`/${teamSlug}/${flow.slug}`);
    } catch (error) {
      if (isAxiosError(error)) {
        const message = error?.response?.data?.error;
        if (message?.includes("Uniqueness violation")) {
          setFieldError("flow.name", "Flow name must be unique");
        }
      }

      throw error;
    }
  };

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  return (
    <Box>
      <AddButton onClick={() => setDialogOpen(true)}>Add a new flow</AddButton>
      <Formik<CreateFlow>
        initialValues={initialValues}
        onSubmit={onSubmit}
        validateOnBlur={false}
        validateOnChange={false}
        validationSchema={validationSchema}
      >
        {({ resetForm, isSubmitting }) => (
          <Dialog
            open={dialogOpen}
            onClose={() => {
              setDialogOpen(false);
              resetForm();
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            fullWidth
          >
            <DialogTitle variant="h3" component="h1">
              <Box sx={{ mt: 1, mb: 4 }}>
                <Typography variant="h3" component="h2" id="dialog-heading">
                  Add a new flow
                </Typography>
              </Box>
            </DialogTitle>
            <Box>
              <Form>
                <DialogContent
                  sx={{ gap: 2, display: "flex", flexDirection: "column" }}
                >
                  <BaseFormSection />
                </DialogContent>
                <DialogActions>
                  <Button
                    disableRipple
                    onClick={() => setDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    variant="contained"
                    disableRipple
                    disabled={isSubmitting}
                  >
                    Add flow
                  </Button>
                </DialogActions>
              </Form>
            </Box>
          </Dialog>
        )}
      </Formik>
    </Box>
  );
};

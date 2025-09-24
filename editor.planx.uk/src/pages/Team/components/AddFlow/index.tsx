import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { logger } from "airbrake";
import { isAxiosError } from "axios";
import { Form, Formik, FormikConfig } from "formik";
import React, { useState } from "react";
import { useNavigation } from "react-navi";
import { AddButton } from "ui/editor/AddButton";
import ErrorWrapper from "ui/shared/ErrorWrapper";

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
    { setFieldError, setStatus },
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
          return;
        }
        if (message?.includes("Invalid HTML")) {
          logger.notify(`Invalid HTML content found in flow ${flow.sourceId}`);
          setStatus({
            error:
              "Failed to create new flow due to a content issue with the source flow, please contact PlanX support. This error has been logged.",
          });
          return;
        }
      }

      setStatus({ error: "Failed to create flow, please try again." });
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
        {({ resetForm, isSubmitting, status }) => (
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
            <DialogTitle variant="h3" component="h1" id="dialog-heading">
              Add a new flow
            </DialogTitle>
            <Box>
              <Form>
                <DialogContent dividers>
                  <ErrorWrapper error={status?.error}>
                    <Box
                      sx={{
                        gap: 2,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <BaseFormSection />
                    </Box>
                  </ErrorWrapper>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() => setDialogOpen(false)}
                    disabled={isSubmitting}
                    variant="contained"
                    color="secondary"
                    sx={{ backgroundColor: "background.default" }}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    variant="contained"
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

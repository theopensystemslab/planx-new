import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useNavigate } from "@tanstack/react-router";
import { logger } from "airbrake";
import type { FormikConfig } from "formik";
import { Form, Formik } from "formik";
import { useToast } from "hooks/useToast";
import React, { useState } from "react";
import { AddButton } from "ui/editor/AddButton";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import { useStore } from "../../../FlowEditor/lib/store";
import { BaseFormSection } from "./BaseFormSection";
import { useCreateFlow } from "./hooks/useCreateFlow";
import type { CreateFlow } from "./types";
import { validationSchema } from "./types";

export const AddFlow: React.FC = () => {
  const navigate = useNavigate();
  const {
    teamId,
    teamSlug,
    showLoading,
    hideLoading,
    setLoadingCompleteCallback,
  } = useStore();
  const toast = useToast();

  const initialValues: CreateFlow = {
    mode: "new",
    flow: {
      slug: "",
      name: "",
      sourceId: "",
      teamId,
      isPattern: false,
      isTemplate: false,
      isService: false,
    },
  };

  const { mutate: createFlow } = useCreateFlow();

  const handleSubmit: FormikConfig<CreateFlow>["onSubmit"] = async (
    values,
    { setFieldError, setStatus },
  ) => {
    setLoadingCompleteCallback(() => {
      toast.success("Flow created successfully");
      setLoadingCompleteCallback(undefined);
    });

    showLoading("Creating flow...");

    createFlow(values, {
      onSuccess: async ({ flow }) => {
        await navigate({
          to: "/app/$team/$flow",
          params: { team: teamSlug, flow: flow.slug },
        });
        hideLoading();
      },
      onError: (error) => {
        setLoadingCompleteCallback(undefined);
        const message = error.data?.error;
        if (message?.includes("Uniqueness violation")) {
          setFieldError("flow.name", "Flow name must be unique");
          hideLoading();
          return;
        }
        if (message?.includes("Invalid HTML")) {
          logger.notify(
            `Invalid HTML content found in flow ${values.flow.sourceId}`,
          );
          setStatus({
            error:
              "Failed to create new flow due to a content issue with the source flow, please contact PlanX support. This error has been logged.",
          });
          hideLoading();
          return;
        }
        setStatus({ error: "Failed to create flow, please try again." });
        hideLoading();
      },
    });
  };

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 0.5 }}>
      <AddButton onClick={() => setDialogOpen(true)}>Add a new flow</AddButton>
      <Formik<CreateFlow>
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validateOnBlur={false}
        validateOnChange={false}
        validationSchema={validationSchema}
        enableReinitialize
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

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog, { dialogClasses } from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { isAxiosError } from "axios";
import { Form, Formik, FormikConfig } from "formik";
import React, { useState } from "react";
import { useNavigation } from "react-navi";
import { AddButton } from "ui/editor/AddButton";

import { useStore } from "../../../FlowEditor/lib/store";
import { BaseFormSection } from "./BaseFormSection";
import { CreateFromCopyFormSection } from "./CreateFromCopyFormSection";
import { CreateFromTemplateFormSection } from "./CreateFromTemplateFormSection";
import { CreateFlow, validationSchema } from "./types";

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
  const { navigate } = useNavigation();
  const { teamId, createFlow, teamSlug } = useStore();

  const initialValues: CreateFlow = {
    mode: "new",
    flow: {
      slug: "",
      name: "",
      sourceId: "",
    },
  };

  const onSubmit: FormikConfig<CreateFlow>["onSubmit"] = async (
    { mode, flow },
    { setFieldError },
  ) => {
    let newFlowId: string | undefined;

    try {
      switch (mode) {
        case "new":
          newFlowId = await createFlow(teamId, flow.slug, flow.name);
          break;
        case "copy":
          // newFlowId = await createFlowFromCopy(flow);
          break;
        case "template":
          // newFlowId = await createFlowFromTemplate(flow);
          break;
      }

      if (!newFlowId) {
        throw new Error("Flow creation failed");
      }

      navigate(`/${teamSlug}/${newFlowId}`);
    } catch (error) {
      if (isAxiosError(error)) {
        const message = error?.response?.data?.error;
        if (message.includes("Uniqueness violation")) {
          setFieldError("flow.name", "Flow name must be unique");
        }
      }

      throw error;
    }
  };

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
        validationSchema={validationSchema}
      >
        {({ resetForm }) => (
          <StyledDialog
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
                  Add a new service
                </Typography>
              </Box>
            </DialogTitle>
            <Box>
              <Form>
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
              </Form>
            </Box>
          </StyledDialog>
        )}
      </Formik>
    </Box>
  );
};

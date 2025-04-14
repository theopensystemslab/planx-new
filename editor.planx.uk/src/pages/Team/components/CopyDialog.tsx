import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { isAxiosError } from "axios";
import { Form, Formik, FormikConfig } from "formik";
import { useToast } from "hooks/useToast";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { URLPrefix } from "ui/editor/URLPrefix";
import InputLabel from "ui/public/InputLabel";
import Input from "ui/shared/Input/Input";
import { slugify } from "utils";

import { CreateFlow, validationSchema } from "./AddFlow/types";

interface Props {
  isDialogOpen: boolean;
  handleClose: () => void;
  sourceFlow: {
    name: string,
    slug: string,
    id: string,
  }
}

export const CopyDialog: React.FC<Props> = ({ isDialogOpen, handleClose, sourceFlow }) => {
  const { teamId, createFlowFromCopy } = useStore();

  const initialValues: CreateFlow = {
    mode: "copy",
    flow: {
      slug: sourceFlow.slug + "-copy",
      name: sourceFlow.name + " (copy)",
      sourceId: sourceFlow.id,
      teamId,
    },
  };

  const toast = useToast();

  const onSubmit: FormikConfig<CreateFlow>["onSubmit"] = async ({ flow }, { setFieldError }) => {
    try {
      await createFlowFromCopy(flow);
      handleClose();
      toast.success(`Created new flow "${flow.name}"`)
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

  return (
    <Formik<CreateFlow>
      initialValues={initialValues}
      onSubmit={onSubmit}
      validateOnBlur={false}
      validateOnChange={false}
      validationSchema={validationSchema}
    >
      {({ resetForm, isSubmitting, getFieldProps, setFieldValue, errors, values }) => (
        <Dialog
          open={isDialogOpen}
          onClose={() => {
            handleClose();
            resetForm();
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth
        >
          <DialogTitle variant="h3" component="h1">
            <Box sx={{ mt: 1, mb: 4 }}>
              <Typography variant="h3" component="h2" id="dialog-heading">
                Copy "{sourceFlow.name}"
              </Typography>
            </Box>
          </DialogTitle>
          <Box>
            <Form>
              <DialogContent
                sx={{ gap: 2, display: "flex", flexDirection: "column" }}
              >
                <InputLabel label="Service name" htmlFor="flow.name">
                  <Input
                    {...getFieldProps("flow.name")}
                    id="flow.name"
                    type="text"
                    onChange={(e) => {
                      setFieldValue("flow.name", e.target.value);
                      setFieldValue("flow.slug", slugify(e.target.value));
                    }}
                    errorMessage={errors.flow?.name}
                    value={values.flow?.name}
                  />
                </InputLabel>
                <InputLabel label="Editor URL" htmlFor="flow.slug">
                  <Input
                    {...getFieldProps("flow.slug")}
                    disabled
                    id="flow.slug"
                    type="text"
                    startAdornment={<URLPrefix />}
                  />
                </InputLabel>
              </DialogContent>
              <DialogActions sx={{ paddingX: 2 }}>
                <Button
                  disableRipple
                  onClick={handleClose}
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
                  Copy service
                </Button>
              </DialogActions>
            </Form>
          </Box>
        </Dialog>
      )}
    </Formik>
  );
};

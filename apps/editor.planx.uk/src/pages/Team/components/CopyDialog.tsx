import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { isAxiosError } from "axios";
import { Form, Formik, FormikConfig } from "formik";
import { useToast } from "hooks/useToast";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { URLPrefix } from "ui/editor/URLPrefix";
import InputLabel from "ui/public/InputLabel";
import Input from "ui/shared/Input/Input";
import { slugify } from "utils";

import { useCreateFlow } from "./AddFlow/hooks/useCreateFlow";
import { CreateFlow, validationSchema } from "./AddFlow/types";

interface Props {
  isDialogOpen: boolean;
  handleClose: () => void;
  sourceFlow: {
    name: string;
    slug: string;
    id: string;
  };
}

export const CopyDialog: React.FC<Props> = ({
  isDialogOpen,
  handleClose,
  sourceFlow,
}) => {
  const teamId = useStore((state) => state.teamId);

  const initialValues: CreateFlow = {
    mode: "copy",
    flow: {
      slug: sourceFlow.slug + "-copy",
      name: sourceFlow.name.trim() + " (copy)",
      sourceId: sourceFlow.id,
      teamId,
    },
  };

  const toast = useToast();
  const { mutate: createFlow } = useCreateFlow();

  const onSubmit: FormikConfig<CreateFlow>["onSubmit"] = async (
    values,
    { setFieldError },
  ) => {
    createFlow(values, {
      onSuccess: () => {
        handleClose();
        toast.success(`Created new flow "${values.flow.name}"`);
      },
      onError: (error) => {
        if (isAxiosError(error)) {
          const message = error?.response?.data?.error;
          if (message?.includes("Uniqueness violation")) {
            setFieldError("flow.name", "Flow name must be unique");
          }
        }

        throw error;
      },
    });
  };

  return (
    <Formik<CreateFlow>
      initialValues={initialValues}
      onSubmit={onSubmit}
      validateOnBlur={false}
      validateOnChange={false}
      validationSchema={validationSchema}
    >
      {({
        resetForm,
        isSubmitting,
        getFieldProps,
        setFieldValue,
        errors,
        values,
      }) => (
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
          <DialogTitle variant="h3" component="h1" id="dialog-heading">
            Make a copy of "{sourceFlow.name}"
          </DialogTitle>
          <Box>
            <Form>
              <DialogContent
                dividers
                sx={{ gap: 2, display: "flex", flexDirection: "column" }}
              >
                <InputLabel label="Flow name" htmlFor="flow.name">
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
              <DialogActions>
                <Button
                  disableRipple
                  onClick={handleClose}
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
                  disableRipple
                  disabled={isSubmitting}
                >
                  Copy flow
                </Button>
              </DialogActions>
            </Form>
          </Box>
        </Dialog>
      )}
    </Formik>
  );
};

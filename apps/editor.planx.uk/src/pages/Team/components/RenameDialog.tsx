import { isApolloError } from "@apollo/client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import type { FormikConfig } from "formik";
import { Form, Formik } from "formik";
import { useToast } from "hooks/useToast";
import React from "react";
import { URLPrefix } from "ui/editor/URLPrefix";
import InputLabel from "ui/public/InputLabel";
import Input from "ui/shared/Input/Input";
import { slugify } from "utils";
import { object, string } from "yup";

import { useRenameAndUnarchiveFlow } from "./hooks/useRenameAndArchiveFlow";
import { useRenameFlow } from "./hooks/useRenameFlow";

interface RenameFlow {
  flowName: string;
  flowSlug: string;
}

interface Props {
  mode: "rename" | "renameAndUnarchive";
  isDialogOpen: boolean;
  handleClose: () => void;
  flow: {
    name: string;
    slug: string;
    id: string;
  };
  teamId: number;
}

const validationSchema = object().shape({
  flowName: string().trim().required("Name is required"),
  flowSlug: string().trim().required("Slug is required"),
});

export const RenameDialog: React.FC<Props> = ({
  mode,
  isDialogOpen,
  handleClose,
  flow,
  teamId,
}) => {
  const toast = useToast();
  const [renameFlow] = useRenameFlow(teamId);
  const [renameAndUnarchiveFlow] = useRenameAndUnarchiveFlow(teamId);

  const onSubmit: FormikConfig<RenameFlow>["onSubmit"] = async (
    { flowName, flowSlug },
    { setFieldError, setSubmitting },
  ) => {
    const variables = {
      flowId: flow.id,
      newName: flowName.trim(),
      newSlug: flowSlug,
      teamId,
    };
    try {
      if (mode === "rename") {
        await renameFlow({
          variables,
        });
        toast.success(`Renamed flow to "${flowName}"`);
      } else {
        await renameAndUnarchiveFlow({
          variables,
        });
        toast.success(`Renamed and unarchived flow "${flowName}"`);
      }
      handleClose();
    } catch (error) {
      const isUniqueSlugError =
        error instanceof Error &&
        isApolloError(error) &&
        error.message.includes("Uniqueness violation");

      if (isUniqueSlugError) {
        setFieldError("flowName", "Flow name must be unique");
      } else {
        toast.error("Failed to rename flow. Please try again.");
      }
      return;
    } finally {
      setSubmitting(false);
    }
  };

  const initialFlowName =
    mode === "rename" ? flow.name : flow.name.concat(" Unarchived");
  const initialFlowSlug =
    mode === "rename"
      ? flow.slug
      : flow.slug.replace(/-archived-\d+$/, "-unarchived");

  return (
    <Formik<RenameFlow>
      initialValues={{ flowName: initialFlowName, flowSlug: initialFlowSlug }}
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
          <DialogTitle variant="h3" component="h1">
            <Box sx={{ mt: 1, mb: 1 }}>
              <Typography variant="h3" component="h2" id="dialog-heading">
                Rename "{flow.name}"
              </Typography>
            </Box>
          </DialogTitle>
          <Box>
            <Form>
              <DialogContent
                sx={{ gap: 2, display: "flex", flexDirection: "column" }}
              >
                {mode === "renameAndUnarchive" && (
                  <Typography>
                    An active flow called "{flow.name}" already exists. To
                    unarchive this one, please give it a unique name first.
                  </Typography>
                )}
                <InputLabel label="Flow name" htmlFor="flowName">
                  <Input
                    {...getFieldProps("flowName")}
                    id="flowName"
                    type="text"
                    onChange={(e) => {
                      setFieldValue("flowName", e.target.value);
                      setFieldValue("flowSlug", slugify(e.target.value));
                    }}
                    errorMessage={errors.flowName}
                    value={values.flowName}
                  />
                </InputLabel>
                <InputLabel label="Editor URL" htmlFor="flowSlug">
                  <Input
                    {...getFieldProps("flowSlug")}
                    disabled
                    id="flowSlug"
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
                  {mode === "rename"
                    ? "Rename flow"
                    : "Rename and unarchive flow"}
                </Button>
              </DialogActions>
            </Form>
          </Box>
        </Dialog>
      )}
    </Formik>
  );
};

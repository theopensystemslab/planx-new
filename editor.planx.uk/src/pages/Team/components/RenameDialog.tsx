import { isApolloError } from "@apollo/client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { Form, Formik, FormikConfig } from "formik";
import gql from "graphql-tag";
import { useToast } from "hooks/useToast";
import { client } from "lib/graphql";
import React from "react";
import { URLPrefix } from "ui/editor/URLPrefix";
import InputLabel from "ui/public/InputLabel";
import Input from "ui/shared/Input/Input";
import { slugify } from "utils";
import { object, string } from "yup";

interface RenameFlow {
  name: string;
  slug: string;
}

interface Props {
  isDialogOpen: boolean;
  handleClose: () => void;
  flow: {
    name: string,
    slug: string,
    id: string,
  }
}

const validationSchema = object().shape({
  slug: string().required("Slug is required"),
  name: string().required("Name is required")
});

export const RenameDialog: React.FC<Props> = ({ isDialogOpen, handleClose, flow }) => {
  const toast = useToast();

  const onSubmit: FormikConfig<RenameFlow>["onSubmit"] = async ({ name, slug }, { setFieldError, setSubmitting }) => {
    try {
      await client.mutate({
        mutation: gql`
          mutation UpdateFlowSlug(
            $flowId: uuid!
            $newSlug: String
            $newName: String
          ) {
            update_flows_by_pk(
              pk_columns: { id: $flowId }
              _set: { slug: $newSlug, name: $newName }
            ) {
              id
            }
          }
        `,
        variables: {
          flowId: flow.id,
          newSlug: slug,
          newName: name.trim(),
        },
      });
      handleClose();
      toast.success(`Renamed flow to "${name}"`)
    } catch (error) {
      if (error instanceof Error && isApolloError(error)) {
        if (error.message.includes("Uniqueness violation")) {
          return setFieldError("name", "Flow name must be unique");
        }
      } else {
        toast.error("Failed to rename flow. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik<RenameFlow>
      initialValues={{ name: flow.name, slug: flow.slug }}
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
                Rename "{flow.name}"
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
                    {...getFieldProps("name")}
                    id="name"
                    type="text"
                    onChange={(e) => {
                      setFieldValue("name", e.target.value);
                      setFieldValue("slug", slugify(e.target.value));
                    }}
                    errorMessage={errors.name}
                    value={values.name}
                  />
                </InputLabel>
                <InputLabel label="Editor URL" htmlFor="slug">
                  <Input
                    {...getFieldProps("slug")}
                    disabled
                    id="slug"
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
                  Rename service
                </Button>
              </DialogActions>
            </Form>
          </Box>
        </Dialog>
      )}
    </Formik>
  );
};

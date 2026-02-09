import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { useNavigate } from "@tanstack/react-router";
import { Form, Formik, FormikConfig } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
import { AddButton } from "ui/editor/AddButton";
import Permission from "ui/editor/Permission";
import { URLPrefix } from "ui/editor/URLPrefix";
import InputLabel from "ui/public/InputLabel";
import Input from "ui/shared/Input/Input";
import { Switch } from "ui/shared/Switch";
import { slugify } from "utils";
import { boolean, object, SchemaOf, string } from "yup";

export interface CreateTeam {
  name: string;
  slug: string;
  settings: {
    isTrial: boolean;
  };
}

const validationSchema: SchemaOf<CreateTeam> = object({
  name: string().required("Name is required"),
  slug: string().required("Slug is required"),
  settings: object({
    isTrial: boolean().required(),
  }),
});

export const AddTeamButton: React.FC = () => {
  const [createTeam] = useStore((state) => [state.createTeam]);
  const navigate = useNavigate();

  const initialValues: CreateTeam = {
    name: "",
    slug: "",
    settings: {
      isTrial: false,
    },
  };

  const onSubmit: FormikConfig<CreateTeam>["onSubmit"] = async (values) => {
    await createTeam(values);
    navigate({ to: `/app/$team`, params: { team: values.slug } });
  };

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  return (
    <Permission.IsPlatformAdmin>
      <AddButton onClick={() => setDialogOpen(true)}>Add a new team</AddButton>
      <Formik<CreateTeam>
        initialValues={initialValues}
        onSubmit={onSubmit}
        validateOnBlur={false}
        validateOnChange={false}
        validationSchema={validationSchema}
      >
        {({
          resetForm,
          getFieldProps,
          errors,
          setFieldValue,
          values,
          isSubmitting,
        }) => (
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
              Add a new team
            </DialogTitle>
            <Box>
              <Form>
                <DialogContent
                  dividers
                  sx={{ gap: 2, display: "flex", flexDirection: "column" }}
                >
                  <InputLabel label="Team name" htmlFor="name">
                    <Input
                      {...getFieldProps("name")}
                      id="name"
                      type="text"
                      onChange={(e) => {
                        setFieldValue("name", e.target.value);
                        setFieldValue("slug", slugify(e.target.value));
                      }}
                      errorMessage={errors.name}
                    />
                  </InputLabel>
                  <InputLabel label="Editor URL" htmlFor="slug">
                    <Input
                      {...getFieldProps("slug")}
                      disabled
                      type="text"
                      startAdornment={<URLPrefix />}
                    />
                  </InputLabel>
                  <Switch
                    name="isTrial"
                    checked={values.settings.isTrial}
                    onChange={() =>
                      setFieldValue(
                        "settings.isTrial",
                        !values.settings.isTrial,
                      )
                    }
                    label={"Trial account"}
                  />
                  <Typography variant="body2" mt={-2}>
                    A trial account has limited access to PlanX functionality
                    (e.g. turning services online). Trial accounts can be
                    promoted to having full access via the settings panel.
                  </Typography>
                </DialogContent>
                <DialogActions>
                  <Button
                    disabled={isSubmitting}
                    onClick={() => setDialogOpen(false)}
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
                    Add team
                  </Button>
                </DialogActions>
              </Form>
            </Box>
          </Dialog>
        )}
      </Formik>
    </Permission.IsPlatformAdmin>
  );
};

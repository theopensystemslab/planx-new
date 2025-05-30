import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useFormik } from "formik";
import { useToast } from "hooks/useToast";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import Permission from "ui/editor/Permission";
import SettingsDescription from "ui/editor/SettingsDescription";
import SettingsSection from "ui/editor/SettingsSection";
import { Switch } from "ui/shared/Switch";
import { boolean, object, SchemaOf } from "yup";

import { FormProps } from ".";

interface TrialAccountForm {
  isTrial: boolean;
}

export default function TrialAccountForm({
  formikConfig,
  onSuccess,
}: FormProps) {
  const formSchema: SchemaOf<TrialAccountForm> = object({
    isTrial: boolean().required(),
  });

  const toast = useToast();


  const formik = useFormik({
    ...formikConfig,
    validationSchema: formSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const isSuccess = await useStore.getState().updateTeamSettings({
          isTrial: values.isTrial,
        });

        if (!isSuccess) throw Error("updateTeamSettings() failed");

        onSuccess();
        resetForm({ values });
      } catch (error) {
        console.error(error)
        toast.error("Failed to update team's trial account status");
      }
    },
  });

  return (
    <Permission.IsPlatformAdmin>
      <Box component="form" onSubmit={formik.handleSubmit} mt={2}>
        <SettingsSection background>
          <Switch
            label="Trial account"
            name="isTrial"
            variant="editorPage"
            capitalize
            checked={formik.values.isTrial}
            onChange={() =>
              formik.setFieldValue("isTrial", !formik.values.isTrial)
            }
          />
          <SettingsDescription>
            <p>Toggle this team between "trial account" and "full access".</p>
            <p>
              A trial account has limited access to PlanX features - they are not
              able to turn services online.
            </p>
            <p>
              Toggling this to a trial account will turn this team's flows offline.
            </p>
          </SettingsDescription>

          <Box>
            <Button type="submit" variant="contained" disabled={!formik.dirty}>
              Save
            </Button>
            <Button
              onClick={() => formik.resetForm()}
              type="reset"
              variant="contained"
              disabled={!formik.dirty}
              color="secondary"
              sx={{ ml: 1.5 }}
            >
              Reset changes
            </Button>
          </Box>
        </SettingsSection>
      </Box>
    </Permission.IsPlatformAdmin>
  );
}

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import { useToast } from "hooks/useToast";
import React from "react";
import SettingsDescription from "ui/editor/SettingsDescription";
import SettingsSection from "ui/editor/SettingsSection";
import { Switch } from "ui/shared/Switch";

import { useStore } from "../../../../lib/store";

export const FlowVisibility = () => {
  const [flowIsCopiable, updateFlowIsCopiable] = useStore((state) => [
    state.flowIsCopiable,
    state.updateFlowIsCopiable,
  ]);
  const toast = useToast();

  const form = useFormik<{ isCopiable: boolean }>({
    initialValues: {
      isCopiable: flowIsCopiable ?? true,
    },
    onSubmit: async (values, { resetForm }) => {
      const isSuccess = await updateFlowIsCopiable(values.isCopiable);
      if (isSuccess) {
        toast.success("Service settings updated successfully");
        // Reset "dirty" status to disable Save & Reset buttons
        resetForm({ values });
      }
    },
  });

  return (
    <Box component="form" onSubmit={form.handleSubmit} mb={2}>
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          Visibility
        </Typography>
        <Typography variant="body1">
          Manage the visibility of your service.
        </Typography>
      </SettingsSection>
      <SettingsSection background>
        <Switch
          label={form.values.isCopiable ? "Copiable by others" : "Not copiable by others"}
          name={"service.status"}
          variant="editorPage"
          checked={form.values.isCopiable}
          onChange={() =>
            form.setFieldValue("isCopiable", !form.values.isCopiable)
          }
        />
        <SettingsDescription>
          <p>
            Toggle your service to allow or prevent others from being able to
            copy your service.
          </p>
        </SettingsDescription>

        <Box>
          <Button type="submit" variant="contained" disabled={!form.dirty}>
            Save
          </Button>
          <Button
            onClick={() => form.resetForm()}
            type="reset"
            variant="contained"
            disabled={!form.dirty}
            color="secondary"
            sx={{ ml: 1.5 }}
          >
            Reset changes
          </Button>
        </Box>
      </SettingsSection>
    </Box>
  );
};

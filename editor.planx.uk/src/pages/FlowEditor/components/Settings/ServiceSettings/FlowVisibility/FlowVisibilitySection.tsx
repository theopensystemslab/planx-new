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
  const [canCreateFromCopy, updateCanCreateFromCopy] = useStore((state) => [
    state.flowCanCreateFromCopy,
    state.updateFlowCanCreateFromCopy,
  ]);
  const toast = useToast();

  const form = useFormik<{ canCreateFromCopy: boolean }>({
    initialValues: {
      canCreateFromCopy: canCreateFromCopy ?? false,
    },
    onSubmit: async (values, { resetForm }) => {
      const isSuccess = await updateCanCreateFromCopy(values.canCreateFromCopy);
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
          label={form.values.canCreateFromCopy ? "Can be copied to create new services" : "Cannot be copied to create new services"}
          name={"service.status"}
          variant="editorPage"
          checked={form.values.canCreateFromCopy}
          onChange={() =>
            form.setFieldValue("canCreateFromCopy", !form.values.canCreateFromCopy)
          }
        />
        <SettingsDescription>
          <p>
            Control if this flow can be used to create new services in other teams. The flow can still be copied and modified within your team.
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

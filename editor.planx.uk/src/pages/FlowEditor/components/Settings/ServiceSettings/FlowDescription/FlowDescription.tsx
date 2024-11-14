import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import { useToast } from "hooks/useToast";
import React from "react";
import InputLabel from "ui/editor/InputLabel";
import SettingsSection from "ui/editor/SettingsSection";
import Input from "ui/shared/Input/Input";

import { useStore } from "../../../../lib/store";
import { SettingsForm } from "../../shared/SettingsForm";

const FlowDescription = () => {
  const [flowDescription, updateFlowDescription] = useStore((state) => [
    state.flowDescription,
    state.updateFlowDescription,
  ]);
  const toast = useToast();

  const formik = useFormik<{ description: string }>({
    initialValues: {
      description: flowDescription || "",
    },
    onSubmit: async (values, { resetForm }) => {
      const isSuccess = await updateFlowDescription(values.description);
      if (isSuccess) {
        toast.success("Description updated successfully");
        resetForm({ values });
      }
      if (!isSuccess) {
        formik.setFieldError(
          "description",
          "We are unable to update the service description, check your internet connection and try again",
        );
      }
    },
  });

  return (
    <Box mb={2}>
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          Service Information
        </Typography>
        <Typography variant="body1">
          Useful information about this service.
        </Typography>
      </SettingsSection>
      <SettingsForm
        legend="Service Description"
        formik={formik}
        description={
          <>
            A short blurb on what this service is, how it should be used, and if
            there are any dependencies related to this service.
          </>
        }
        input={
          <>
            <InputLabel label="Description" htmlFor="description">
              <Input
                name="description"
                onChange={(event) => {
                  formik.setFieldValue("description", event.target.value);
                }}
                value={formik.values.description ?? ""}
                errorMessage={formik.errors.description}
                id="description"
              />
            </InputLabel>
          </>
        }
      />
    </Box>
  );
};

export default FlowDescription;

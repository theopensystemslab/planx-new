import { DocumentNode } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { type FormikValues, useFormik } from "formik";
import { useToast } from "hooks/useToast";
import React from "react";
import InputLegend from "ui/editor/InputLegend";
import NewSettingsSection from "ui/editor/NewSettingsSection";
import SettingsDescription from "ui/editor/SettingsDescription";
import type { SchemaOf } from "yup";

interface SettingsFormContainerProps<
  TData,
  TVariables,
  TFormValues extends FormikValues,
> {
  query: DocumentNode;
  queryVariables?: Record<string, unknown>;
  mutation: DocumentNode;
  /** Extract the initial values from query data */
  getInitialValues: (data: TData) => TFormValues;
  defaultValues: TFormValues;
  /** Transform form values to mutation variables */
  getMutationVariables: (
    values: TFormValues,
    data: TData,
  ) => TVariables | Promise<TVariables>;
  validationSchema: SchemaOf<TFormValues>;
  legend: string;
  description: React.ReactNode;
  /** Optional success handler for side-effects (e.g. Slack messages, store updates) */
  onSuccess?: (
    formik: ReturnType<typeof useFormik<TFormValues>>,
    data: TData | undefined,
  ) => void;
  successMessage?: string;
  preview?: (
    formik: ReturnType<typeof useFormik<TFormValues>>,
  ) => React.ReactNode;
  children: (props: {
    formik: ReturnType<typeof useFormik<TFormValues>>;
    data: TData | undefined;
    loading: boolean;
  }) => React.ReactNode;
  /**
   * Hide "Save" and "Reset form" buttons
   *
   * Allows manual submission via formik.submitForm(), for example
   * if a confirmation dialog or other custom actions are required
   */
  showActionButtons?: boolean;
}

/**
 * Container for settings forms across the PlanX Editor interface
 *
 * Handles querying and mutating data, scaffolding of form structure,
 * as well as success, loading and error states
 */
const SettingsFormContainer = <
  TData,
  TVariables,
  TFormValues extends FormikValues,
>({
  query,
  queryVariables,
  mutation,
  getInitialValues,
  defaultValues,
  getMutationVariables,
  validationSchema,
  legend,
  description,
  onSuccess,
  successMessage = "Settings updated successfully",
  children,
  preview,
  showActionButtons = true,
}: SettingsFormContainerProps<TData, TVariables, TFormValues>) => {
  const toast = useToast();

  // Fetch current data
  const { data, loading, error } = useQuery<TData>(query, {
    variables: queryVariables,
  });

  // Update data
  const [updateSettings, { loading: updating }] = useMutation<
    unknown,
    TVariables
  >(mutation, {
    onCompleted: () => {
      toast.success(successMessage);
      onSuccess && onSuccess(formik, data);
    },
    onError: (error) => {
      console.error("Settings update error:", error);
      toast.error("Failed to update settings");
    },
  });

  const formik = useFormik<TFormValues>({
    initialValues: data ? getInitialValues(data) : defaultValues,
    enableReinitialize: true,
    validationSchema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (!data) throw Error("Unable to mutate, missing initial data");

        const variables = await getMutationVariables(values, data);
        await updateSettings({ variables });
        resetForm({ values });
      } catch (error) {
        console.error("Settings update error:", error);
        toast.error("Failed to update settings");
      }
    },
  });

  if (error) {
    return (
      <NewSettingsSection>
        <p>Error loading settings: {error.message}</p>
      </NewSettingsSection>
    );
  }

  if (loading && !data) {
    return (
      <NewSettingsSection>
        <p>Loading...</p>
      </NewSettingsSection>
    );
  }

  return (
    <NewSettingsSection>
      <Box component="form" onSubmit={formik.handleSubmit}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <InputLegend gutterBottom>{legend}</InputLegend>
            <SettingsDescription>{description}</SettingsDescription>
          </Grid>

          <Grid item xs={12} md={8}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                paddingTop: 0.25,
              }}
            >
              {children({ formik, data, loading })}
            </Box>
            {preview && <Box mt={2}>{preview(formik)}</Box>}
            {showActionButtons &&
              <Box mt={2} display="flex" gap={1.5}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!formik.dirty || updating}
                >
                  Save
                </Button>
                <Button
                  onClick={() => formik.resetForm()}
                  type="reset"
                  variant="contained"
                  disabled={!formik.dirty}
                  color="secondary"
                >
                  Reset changes
                </Button>
              </Box>
            }
          </Grid>
        </Grid>
      </Box>
    </NewSettingsSection>
  );
};

export default SettingsFormContainer;

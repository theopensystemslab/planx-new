import { DocumentNode } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { type FormikValues, useFormik } from "formik";
import { useToast } from "hooks/useToast";
import React from "react";
import InputGroup from "ui/editor/InputGroup";
import InputLegend from "ui/editor/InputLegend";
import SettingsDescription from "ui/editor/SettingsDescription";
import SettingsSection from "ui/editor/SettingsSection";
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
  /** Transform form values to mutation variables */
  getMutationVariables: (values: TFormValues) => TVariables;
  validationSchema: SchemaOf<TFormValues>;
  legend: string;
  description: React.ReactNode;
  /** Optional success handler for side-effects (e.g. Slack messages, store updates) */
  onSuccess?: (values: TFormValues, data: TData | undefined) => void;
  successMessage?: string;
  preview?: (
    formik: ReturnType<typeof useFormik<TFormValues>>,
  ) => React.ReactNode;
  children: (props: {
    formik: ReturnType<typeof useFormik<TFormValues>>;
    data: TData | undefined;
    loading: boolean;
  }) => React.ReactNode;
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
  getMutationVariables,
  validationSchema,
  legend,
  description,
  onSuccess,
  successMessage = "Settings updated successfully",
  children,
  preview,
}: SettingsFormContainerProps<TData, TVariables, TFormValues>) => {
  const toast = useToast();

  // Fetch current data
  const { data, loading, error } = useQuery<TData>(query, {
    variables: queryVariables,
    fetchPolicy: "cache-and-network",
  });

  // Update data
  const [updateSettings, { loading: updating }] = useMutation<
    unknown,
    TVariables
  >(mutation, {
    onCompleted: () => {
      toast.success(successMessage);
      onSuccess && onSuccess(formik.values, data);
    },
    onError: (error) => {
      console.error("Settings update error:", error);
      toast.error("Failed to update settings");
    },
  });

  const formik = useFormik<TFormValues>({
    initialValues: data
      ? getInitialValues(data)
      : (validationSchema.getDefault() as TFormValues),
    enableReinitialize: true,
    validationSchema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async (values, { resetForm }) => {
      const variables = getMutationVariables(values);
      await updateSettings({ variables });
      // Reset dirty state after successful save
      resetForm({ values });
    },
  });

  if (error) {
    return (
      <SettingsSection background>
        <p>Error loading settings: {error.message}</p>
      </SettingsSection>
    );
  }

  if (loading && !data) {
    return (
      <SettingsSection background>
        <p>Loading...</p>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection background>
      <Box component="form" onSubmit={formik.handleSubmit}>
        <InputGroup flowSpacing>
          <InputLegend>{legend}</InputLegend>
          <SettingsDescription>{description}</SettingsDescription>
          {children({ formik, data, loading })}
        </InputGroup>
        {preview && <Box mt={2}>{preview(formik)}</Box>}
        <Box mt={2}>
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
            sx={{ ml: 1.5 }}
          >
            Reset changes
          </Button>
        </Box>
      </Box>
    </SettingsSection>
  );
};

export default SettingsFormContainer;

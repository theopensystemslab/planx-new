import { DocumentNode, useMutation, useQuery } from "@apollo/client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { Form, Formik, FormikHelpers, FormikProps, FormikValues } from "formik";
import { useToast } from "hooks/useToast";
import { useStore } from "pages/FlowEditor/lib/store";
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
    data: TData | undefined,
    formikHelpers: FormikHelpers<TFormValues>,
    values: TFormValues,
  ) => void;
  successMessage?: string;
  preview?: (formik: FormikProps<TFormValues>) => React.ReactNode;
  children: (props: {
    formik: FormikProps<TFormValues>;
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
  const [teamSlug, canUserEditTeam] = useStore((state) => [
    state.teamSlug,
    state.canUserEditTeam,
  ]);
  const userPermissionError = !canUserEditTeam(teamSlug);

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
    },
    onError: (error) => {
      console.error("Settings update error:", error);
      toast.error("Failed to update settings");
    },
  });

  const initialValues = data ? getInitialValues(data) : defaultValues;

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

  const handleSubmit = async (
    values: TFormValues,
    formikHelpers: FormikHelpers<TFormValues>,
  ) => {
    try {
      if (!data) throw Error("Unable to mutate, missing initial data");

      const variables = await getMutationVariables(values, data);
      await updateSettings({ variables });

      onSuccess && onSuccess(data, formikHelpers, values);
      formikHelpers.resetForm({ values });
    } catch (error) {
      console.error("Settings update error:", error);
      toast.error("Failed to update settings");
    }
  };

  return (
    <NewSettingsSection>
      <Formik<TFormValues>
        initialValues={initialValues}
        enableReinitialize={true}
        validationSchema={validationSchema}
        validateOnBlur={false}
        validateOnChange={false}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form>
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
                {showActionButtons && (
                  <Box mt={2} display="flex" gap={1.5}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={
                        userPermissionError || !formik.dirty || updating
                      }
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => formik.resetForm()}
                      type="reset"
                      variant="contained"
                      disabled={userPermissionError || !formik.dirty}
                      color="secondary"
                    >
                      Reset changes
                    </Button>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </NewSettingsSection>
  );
};

export default SettingsFormContainer;

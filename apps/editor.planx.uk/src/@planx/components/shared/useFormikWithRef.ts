import type { FormikConfig, FormikProps, FormikValues } from "formik";
import { useFormik } from "formik";
import { useEffect } from "react";

/**
 * Hook to sync a Formik instance with a parent ref.
 * This enables the FormModal to track the changed/unchanged state for unsaved changes warnings.
 */
export function useFormikWithRef<T extends FormikValues>(
  formikConfig: FormikConfig<T>,
  formikRef?: {
    current: FormikProps<T> | null;
    onDirtyChange: (dirty: boolean) => void;
  },
) {
  const formik = useFormik<T>({
    validateOnChange: false,
    validateOnBlur: false,
    ...formikConfig,
  });

  useEffect(() => {
    if (formikRef) {
      formikRef.current = formik;
    }
  });

  useEffect(() => {
    if (formikRef) {
      formikRef.onDirtyChange(formik.dirty);
    }
  }, [formik.dirty, formikRef]);

  // Not every validation error is exhaustively mapped to a field in the UI
  // This means a validation failure will blocked a save without visual feedback
  // console.debug()ing these errors lets us diagnose easily outside local dev environments
  useEffect(() => {
    const hasFailedSubmit =
      !formik.isSubmitting &&
      formik.submitCount > 0 &&
      Object.keys(formik.errors).length > 0;

    if (hasFailedSubmit) {
      console.debug("Form validation failed", formik.errors);
    }
  }, [formik.isSubmitting, formik.submitCount, formik.errors]);

  return formik;
}

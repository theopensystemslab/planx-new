import type { FormikConfig, FormikProps, FormikValues } from "formik";
import { useFormik } from "formik";
import type { MutableRefObject } from "react";
import { useEffect } from "react";

/**
 * Hook to sync a Formik instance with a parent ref.
 * This enables the FormModal to track the changed/unchanged state for unsaved changes warnings.
 */
export function useFormikWithRef<T extends FormikValues>(
  formikConfig: FormikConfig<T>,
  formikRef?: MutableRefObject<FormikProps<T> | null>,
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

  return formik;
}

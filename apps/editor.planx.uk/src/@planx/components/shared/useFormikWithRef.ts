import { FormikProps } from "formik";
import { MutableRefObject, useEffect } from "react";

/**
 * Hook to sync a Formik instance with a parent ref.
 * This enables the FormModal to track the changed/unchanged state for unsaved changes warnings.
 */
export function useFormikWithRef<Values>(
  formik: FormikProps<Values>,
  formikRef?: MutableRefObject<FormikProps<Values> | null>,
): void {
  useEffect(() => {
    if (formikRef) {
      formikRef.current = formik;
    }
  }, [formik, formikRef]);
}

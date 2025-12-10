import { FormikProps, FormikValues } from "formik";
import React, { MutableRefObject, useEffect } from "react";

interface FormikRefSyncProps<T extends FormikValues> {
  formik: FormikProps<T>;
  formikRef?: MutableRefObject<FormikProps<T> | null>;
  children: React.ReactNode;
}

/**
 * Syncs a Formik instance from the <Formik> component with a parent ref.
 * This enables the FormModal to track the dirty state for unsaved changes warnings.
 */
export function FormikRefSync<T extends FormikValues>({
  formik,
  formikRef,
  children,
}: FormikRefSyncProps<T>) {
  useEffect(() => {
    if (formikRef) {
      formikRef.current = formik;
    }
  }, [formik, formikRef]);

  return <>{children}</>;
}

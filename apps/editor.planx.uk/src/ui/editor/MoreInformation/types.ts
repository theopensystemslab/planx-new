import type { BaseNodeData } from "@planx/components/shared";
import type { FormikProps, useFormik } from "formik";

export interface MoreInformationProps<T extends BaseNodeData> {
  formik: ReturnType<typeof useFormik<T>> | FormikProps<T>;
  disabled?: boolean;
}

import type { PublicProps } from "@planx/components/shared/types";

import type { EnhancedTextInput } from "../types";

export type Props = PublicProps<EnhancedTextInput>;

interface FormValuesBase {
  userInput: string;
}

interface FormValuesIdle extends FormValuesBase {
  status: "idle";
  enhanced: null;
  error: null;
}

interface FormValuesSuccess extends FormValuesBase {
  status: "success";
  original: string;
  enhanced: string;
  error: null;
}

interface FormValuesError extends FormValuesBase {
  status: "error";
  original: string;
  enhanced: null;
  error: string;
}

export type FormValues = FormValuesIdle | FormValuesSuccess | FormValuesError;

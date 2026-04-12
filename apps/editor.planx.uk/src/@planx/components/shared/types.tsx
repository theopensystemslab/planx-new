import { ComponentType } from "@opensystemslab/planx-core/types";
import { FormikProps } from "formik";
import { Store } from "pages/FlowEditor/lib/store";
import type { HandleSubmit } from "pages/Preview/Node";
import React, { MutableRefObject } from "react";

import { Option } from "../Option/model";

export interface Child {
  id?: string;
  type: ComponentType.Answer;
  data: Option["data"];
}

export type EditorProps<
  Type extends ComponentType,
  Data,
  ExtraProps extends object = Record<string, unknown>,
> = {
  formikRef?: MutableRefObject<FormikProps<any> | null>;
  id?: string;
  handleSubmit?: (data: { type: Type; data: Data }, children?: Child[]) => void;
  node?: any;
  disabled?: boolean;
} & ExtraProps;

export type PublicProps<Data> = Data & {
  id?: string;
  handleSubmit?: HandleSubmit;
  resetButton?: boolean;
  resetPreview?: () => void;
  autoFocus?: boolean;
  previouslySubmittedData?: Store.UserData;
  autoAnswers?: string[] | undefined;
};

export const FormError: React.FC<{ message: string }> = ({ message }) =>
  message ? <span className="error">{message}</span> : null;

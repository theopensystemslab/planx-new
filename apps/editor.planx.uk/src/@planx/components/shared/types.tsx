import { ComponentType } from "@opensystemslab/planx-core/types";
import { Store } from "pages/FlowEditor/lib/store";
import type { HandleSubmit } from "pages/Preview/Node";
import React from "react";

import { Option } from ".";

export type EditorProps<
  Type extends ComponentType,
  Data,
  ExtraProps extends Record<string, unknown> = Record<string, unknown>,
> = {
  id?: string;
  handleSubmit?: (
    data: { type: Type; data: Data },
    children?: {
      id?: string;
      type: ComponentType.Answer;
      data: Option["data"];
    }[],
  ) => void;
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

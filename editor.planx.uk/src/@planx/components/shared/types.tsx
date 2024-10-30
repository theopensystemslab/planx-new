import { Store } from "pages/FlowEditor/lib/store";
import type { HandleSubmit } from "pages/Preview/Node";
import React from "react";

export interface EditorProps<Type, Data> {
  id?: string;
  handleSubmit?: (data: { type: Type; data: Data }) => void;
  node?: any;
}

export type PublicProps<Data> = Data & {
  id?: string;
  handleSubmit?: HandleSubmit;
  resetButton?: boolean;
  resetPreview?: () => void;
  autoFocus?: boolean;
  previouslySubmittedData?: Store.UserData;
};

export const FormError: React.FC<{ message: string }> = ({ message }) =>
  message ? <span className="error">{message}</span> : null;

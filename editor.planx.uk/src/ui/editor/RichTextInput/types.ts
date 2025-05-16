import type { InputBaseProps } from "@mui/material/InputBase";
import { ChangeEvent } from "react";

export interface MentionListProps {
  items: Placeholder[];
  query: string;
  command: any;
  onCreatePlaceholder: (val: string) => void;
}
export interface Placeholder {
  id: string;
  label: string;
}
export interface Props extends InputBaseProps {
  className?: string;
  onChange?: (ev: ChangeEvent<HTMLInputElement>) => void;
  bordered?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  rootLevelContent?: boolean;
  classname?: string;
}
export interface VariablesState {
  variables: string[];
  addVariable: (newVariable: string) => void;
}

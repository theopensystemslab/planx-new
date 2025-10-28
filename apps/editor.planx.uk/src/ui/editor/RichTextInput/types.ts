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

/**
 * Used on a "blank" content page
 * Allows heading options h1 + h2
 * @example Content component
 */
type RootLevelContent = "rootLevelContent";

/**
 * Used in instances where a h1 is already present on page,
 * Allows heading options h2 + h3
 * @example Component descriptions
 */
type Default = "default";

/**
 * Used in instances where a h1 and h2 are already present
 * Allows heading options h2 + h3
 * @example Help text
 */
type NestedContent = "nestedContent";

/**
 * Used where we don't want headings, but do allow lists, anchors, images etc
 * Does not allow headings
 * @example Section descriptions
 */
type ParagraphContent = "paragraphContent";

export type Variant =
  | Default
  | RootLevelContent
  | NestedContent
  | ParagraphContent;

export interface Props extends InputBaseProps {
  className?: string;
  onChange?: (ev: ChangeEvent<HTMLInputElement>) => void;
  bordered?: boolean;
  errorMessage: string | undefined;
  disabled?: boolean;
  variant?: Variant;
  classname?: string;
}

export interface VariablesState {
  variables: string[];
  addVariable: (newVariable: string) => void;
}

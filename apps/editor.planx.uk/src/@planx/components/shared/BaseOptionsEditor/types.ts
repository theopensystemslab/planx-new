import { ComponentType } from "@opensystemslab/planx-core/types";
import { ReactNode } from "react";

import { ConditionalOption, Option } from "../../Option/model";

interface BaseOptionsEditorProps {
  type:
    | ComponentType.Question
    | ComponentType.Checklist
    | ComponentType.ResponsiveQuestion
    | ComponentType.ResponsiveChecklist;
  schema?: string[];
  optionPlaceholder?: string;
  showValueField: boolean;
  showDescriptionField?: boolean;
  children?: ReactNode;
  disabled?: boolean;
  index: number;
  isCollapsed?: boolean;
}

export interface OptionEditor extends BaseOptionsEditorProps {
  type: ComponentType.Question | ComponentType.Checklist;
  value: Option;
  onChange: (newVal: Option) => void;
}

export interface ConditionalOptionEditor extends BaseOptionsEditorProps {
  type: ComponentType.ResponsiveQuestion | ComponentType.ResponsiveChecklist;
  value: ConditionalOption;
  onChange: (newVal: ConditionalOption) => void;
}

export type Props = OptionEditor | ConditionalOptionEditor;

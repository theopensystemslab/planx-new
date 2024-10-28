import { BaseNodeData, Option } from "../shared";
import type { Category, Checklist } from "./model";

export interface ChecklistProps extends Checklist {
  text: string;
  handleSubmit?: Function;
  node?: {
    data?: {
      allRequired?: boolean;
      categories?: Array<Category>;
      description?: string;
      fn?: string;
      img?: string;
      text: string;
    } & BaseNodeData;
  };
}
export interface OptionEditorProps {
  index: number;
  value: Option;
  onChange: (newVal: Option) => void;
  groupIndex?: number;
  groups?: Array<string>;
  onMoveToGroup?: (itemIndex: number, groupIndex: number) => void;
  showValueField?: boolean;
}

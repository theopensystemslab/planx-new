import { BaseNodeData, Option } from "../shared";
import { PublicProps } from "../shared/types";
import type { Category, Checklist } from "./model";

export interface ChecklistProps extends Checklist {
  text: string;
  handleSubmit?: Function;
  node?: {
    data?: {
      allRequired?: boolean;
      neverAutoAnswer?: boolean;
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

export type Props = PublicProps<Checklist>;

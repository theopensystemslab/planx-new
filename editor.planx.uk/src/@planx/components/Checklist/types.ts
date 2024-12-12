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

export type Props = PublicProps<Checklist>;

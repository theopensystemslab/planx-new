import { array } from "yup";

import { BaseNodeData, Option } from "../shared";
import { ChecklistLayout } from "./Public/Public";

export interface Group<T> {
  title: string;
  children: Array<T>;
}

export interface Category {
  title: string;
  count: number;
}

export interface Checklist extends BaseNodeData {
  fn?: string;
  description?: string;
  text?: string;
  options?: Array<Option>;
  groupedOptions?: Array<Group<Option>>;
  img?: string;
  allRequired?: boolean;
  categories?: Array<Category>;
  neverAutoAnswer?: boolean;
  exclusiveOrOption?: Array<Option>;
}

interface ChecklistExpandableProps {
  options?: Array<Option>;
  groupedOptions?: Array<Group<Option>>;
}

export const toggleExpandableChecklist = (
  checklist: ChecklistExpandableProps,
): ChecklistExpandableProps => {
  if (checklist.options !== undefined && checklist.options.length > 0) {
    return {
      ...checklist,
      groupedOptions: [
        {
          title: "Section 1",
          children: checklist.options,
        },
      ],
      options: undefined,
    };
  } else if (
    checklist.groupedOptions !== undefined &&
    checklist.groupedOptions.length > 0
  ) {
    return {
      ...checklist,
      options: checklist.groupedOptions.flatMap((opt) => opt.children),
      groupedOptions: undefined,
    };
  } else {
    return {
      ...checklist,
      options: checklist.options || [],
      groupedOptions: checklist.groupedOptions || [
        {
          title: "Section 1",
          children: [],
        },
      ],
    };
  }
};

export const getFlatOptions = ({
  options,
  groupedOptions,
}: {
  options: Checklist["options"];
  groupedOptions: Checklist["groupedOptions"];
}) => {
  if (options) {
    return options;
  }
  if (groupedOptions) {
    return groupedOptions.flatMap((group) => group.children);
  }
  return [];
};

export const getLayout = ({
  options,
  groupedOptions,
}: {
  options: Checklist["options"];
  groupedOptions: Checklist["groupedOptions"];
}): ChecklistLayout => {
  const hasImages = options?.some((o) => o.data.img);
  if (hasImages) return ChecklistLayout.Images;

  if (groupedOptions) return ChecklistLayout.Grouped;

  return ChecklistLayout.Basic;
};

export const checklistValidationSchema = ({
  allRequired,
  options,
  groupedOptions,
}: Checklist) => {
  const flatOptions = getFlatOptions({ options, groupedOptions });

  return array()
    .required()
    .test({
      name: "atLeastOneChecked",
      message: "Select at least one option",
      test: (checked?: Array<string>) => {
        return Boolean(checked && checked.length > 0);
      },
    })
    .test({
      name: "notAllChecked",
      message: "All options must be checked",
      test: (checked?: Array<string>) => {
        if (!allRequired) {
          return true;
        }
        const allChecked = checked && checked.length === flatOptions.length;
        return Boolean(allChecked);
      },
    });
};

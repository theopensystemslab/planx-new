import { partition } from "lodash";
import { array } from "yup";

import { BaseNodeData, Option } from "../shared";

export enum ChecklistLayout {
  Basic,
  Grouped,
  Images,
}

export interface Group<T> {
  title: string;
  exclusive?: true;
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
  autoAnswers?: string[] | undefined;
}

interface ChecklistExpandableProps {
  options?: Array<Option>;
  groupedOptions?: Array<Group<Option>>;
}

export const toggleExpandableChecklist = ({
  options,
  groupedOptions,
}: ChecklistExpandableProps) => {
  const checklist = [options, groupedOptions];

  // toggle from unexpanded to expanded
  if (options !== undefined && options.length > 0) {
    const [exclusiveOptions, nonExclusiveOptions]: Option[][] = partition(
      options,
      (option) => option.data.exclusive,
    );

    const newGroupedOptions = [
      {
        title: "Section 1",
        children: nonExclusiveOptions,
      },
    ];

    if (exclusiveOptions.length > 0) {
      newGroupedOptions.push({
        title: "Or",
        children: exclusiveOptions,
      });
    }

    return {
      ...checklist,
      groupedOptions: newGroupedOptions,
      options: undefined,
    };

    // toggle from expanded to unexpanded
  } else if (groupedOptions !== undefined && groupedOptions.length > 0) {
    return {
      ...checklist,
      options: groupedOptions.flatMap((opt) => opt.children),
      groupedOptions: undefined,
    };
  } else {
    return {
      ...checklist,
      options: options || [],
      groupedOptions: groupedOptions || [
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

export const checklistInputValidationSchema = ({
  data: { allRequired, options, groupedOptions },
  required,
}: {
  // Cannot use FieldValidationSchema<ChecklistInput> as this is a simplified representation (i.e. no groups)
  data: Checklist;
  required: boolean;
}) => {
  const flatOptions = getFlatOptions({ options, groupedOptions });

  return array()
    .when([], {
      is: () => required,
      then: array().min(1, "Select at least one option"),
      otherwise: array().notRequired(),
    })
    .test({
      name: "notAllChecked",
      message: "All options must be checked",
      test: (checked?: Array<string>) => {
        if (!checked?.length) return true;
        if (!allRequired) return true;

        const allChecked = checked && checked.length === flatOptions.length;
        return Boolean(allChecked);
      },
    });
};

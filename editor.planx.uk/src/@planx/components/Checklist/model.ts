import { MoreInformation, Option } from "../shared";

export interface Group<T> {
  title: string;
  children: Array<T>;
}

export interface Checklist extends MoreInformation {
  fn?: string;
  description?: string;
  text?: string;
  options?: Array<Option>;
  groupedOptions?: Array<Group<Option>>;
  img?: string;
  allRequired?: boolean;
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

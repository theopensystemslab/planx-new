import { ChecklistWithOptions } from "@planx/components/Checklist/model";
import { Option } from "@planx/components/Option/model";
import { richText } from "lib/yupExtensions";
import { partition } from "lodash";
import { object, SchemaOf, string } from "yup";

import {
  BaseNodeData,
  baseNodeDataValidationSchema,
  parseBaseNodeData,
} from "..";

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

export interface BaseChecklist extends BaseNodeData {
  fn?: string;
  description?: string;
  text?: string;
  img?: string;
}

export const parseBaseChecklist = (
  data: Record<string, any> | undefined,
): BaseChecklist => ({
  fn: data?.fn || "",
  description: data?.description || "",
  text: data?.text || "",
  img: data?.img || "",
  ...parseBaseNodeData(data),
});

export const baseChecklistValidationSchema: SchemaOf<BaseChecklist> =
  baseNodeDataValidationSchema.concat(
    object({
      description: richText(),
      fn: string(),
      text: string(),
      img: string(),
    }),
  );

export const toggleExpandableChecklist = ({
  options,
  groupedOptions,
  ...checklist
}: ChecklistWithOptions): ChecklistWithOptions => {
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
      options: undefined,
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
  // TODO: Add ResponsiveChecklist types?
  options: ChecklistWithOptions["options"];
  groupedOptions: ChecklistWithOptions["groupedOptions"];
}) => {
  if (options) return options;
  if (groupedOptions) return groupedOptions.flatMap(({ children }) => children);
  return [];
};

export const getLayout = ({
  options,
  groupedOptions,
}: {
  // TODO: Add ResponsiveChecklist types?
  options: ChecklistWithOptions["options"];
  groupedOptions: ChecklistWithOptions["groupedOptions"];
}): ChecklistLayout => {
  const hasImages = options?.some((o) => o.data.img);
  if (hasImages) return ChecklistLayout.Images;

  if (groupedOptions) return ChecklistLayout.Grouped;

  return ChecklistLayout.Basic;
};

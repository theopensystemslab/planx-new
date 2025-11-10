import { ChecklistWithOptions } from "@planx/components/Checklist/model";
import { ConditionalOption, Option } from "@planx/components/Option/model";
import { ResponsiveChecklistWithOptions } from "@planx/components/ResponsiveChecklist/model";
import { richText } from "lib/yupExtensions";
import { partition } from "lodash";
import { array, number, object, string } from "yup";

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

/**
 * Utility type for where checklist types are interchangeable
 */
export type AnyChecklist =
  | ChecklistWithOptions
  | ResponsiveChecklistWithOptions;

export interface FlatOptions<T extends Option | ConditionalOption> {
  options: Array<T>;
  groupedOptions?: undefined;
}

export interface GroupedOptions<T extends Option | ConditionalOption> {
  options?: undefined;
  groupedOptions: Array<Group<T>>;
}

export interface Group<T> {
  title: string;
  exclusive?: true;
  children: Array<T>;
}

export type OptionGroup = Group<Option> | Group<ConditionalOption>;

export interface Category {
  title: string;
  count: number;
}

export interface BaseChecklist extends BaseNodeData {
  fn?: string;
  description?: string;
  text?: string;
  img?: string;
  categories?: Array<Category>;
}

export const parseBaseChecklist = (
  data: Record<string, any> | undefined,
): BaseChecklist => ({
  fn: data?.fn || "",
  description: data?.description || "",
  text: data?.text || "",
  img: data?.img || "",
  categories: data?.categories || [],
  ...parseBaseNodeData(data),
});

export const baseChecklistValidationSchema =
  baseNodeDataValidationSchema.concat(
    object({
      description: richText(),
      fn: string(),
      text: string(),
      img: string(),
      categories: array(
        object({
          title: string().trim().required(),
          count: number().required(),
        }),
      ),
    }),
  );

export const toggleExpandableChecklist = <
  T extends ChecklistWithOptions | ResponsiveChecklistWithOptions,
>({
  options,
  groupedOptions,
  ...checklist
}: T): T => {
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
    } as T;

    // toggle from expanded to unexpanded
  } else if (groupedOptions !== undefined && groupedOptions.length > 0) {
    return {
      ...checklist,
      options: groupedOptions.flatMap((opt) => opt.children),
      groupedOptions: undefined,
    } as T;
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
    } as T;
  }
};

interface ChecklistOpts {
  options?: Option[] | ConditionalOption[];
  groupedOptions?: Group<Option>[] | Group<ConditionalOption>[];
}

export const getFlatOptions = ({ options, groupedOptions }: ChecklistOpts) => {
  if (options) return options;
  if (groupedOptions) return groupedOptions.flatMap(({ children }) => children);
  return [];
};

export const getLayout = ({
  options,
  groupedOptions,
}: ChecklistOpts): ChecklistLayout => {
  const hasImages = options?.some((o) => o.data.img);
  if (hasImages) return ChecklistLayout.Images;

  if (groupedOptions) return ChecklistLayout.Grouped;

  return ChecklistLayout.Basic;
};

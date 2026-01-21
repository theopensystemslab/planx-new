import { ComponentType } from "@opensystemslab/planx-core/types";
import {
  type Checklist,
  ChecklistWithOptions,
} from "@planx/components/Checklist/model";
import {
  type AnyOption,
  ConditionalOption,
  Option,
} from "@planx/components/Option/model";
import {
  type ResponsiveChecklist,
  ResponsiveChecklistWithOptions,
} from "@planx/components/ResponsiveChecklist/model";
import { richText } from "lib/yupExtensions";
import { partition } from "lodash";
import { array, number, object, string, type TestConfig } from "yup";

import {
  BaseNodeData,
  baseNodeDataValidationSchema,
  parseBaseNodeData,
} from "..";
import type { Child } from "../types";

export enum ChecklistLayout {
  Basic,
  Grouped,
  Images,
  GroupedImages,
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
  if (groupedOptions?.length) {
    const hasImages = groupedOptions.some((group) =>
      group.children.some((option) => option.data?.img),
    );
    return hasImages ? ChecklistLayout.GroupedImages : ChecklistLayout.Grouped;
  }

  const hasImages = options?.some((o) => o.data.img);
  if (hasImages) return ChecklistLayout.Images;

  return ChecklistLayout.Basic;
};

export const generatePayload = ({
  options,
  groupedOptions,
  ...values
}: AnyChecklist): {
  children: Child[];
  data: Checklist | ResponsiveChecklist;
} => {
  const sourceOptions: AnyOption[] | undefined = options?.length
    ? options
    : groupedOptions?.flatMap((group) => group.children);

  const filteredOptions = (sourceOptions || []).filter(
    (option) => option.data.text,
  );

  const children: Child[] = filteredOptions.map((option) => ({
    ...option,
    id: option.id || undefined,
    type: ComponentType.Answer as const,
  }));

  const categories: Category[] | undefined = groupedOptions?.map((group) => ({
    title: group.title,
    count: group.children.length,
  }));

  const data = {
    ...values,
    ...(groupedOptions ? { categories } : { categories: undefined }),
  };

  return { data, children };
};

const onlyOneExclusiveOptionTest: TestConfig<ChecklistWithOptions> = {
  name: "onlyOneExclusiveOption",
  test: function ({ options }) {
    const exclusiveOptions = options?.filter(({ data }) => data.exclusive);
    if (!exclusiveOptions?.length) return true;
    if (exclusiveOptions.length === 1) return true;
    return this.createError({
      path: "options",
      message: "There should be a maximum of one exclusive option configured",
    });
  },
};

const atLeastOneDataFieldTest: TestConfig<AnyChecklist> = {
  name: "atLeastOneDataField",
  test: function ({ fn, options = [], groupedOptions = [] }) {
    if (!fn) return true;
    const allOptions = [
      ...options,
      ...groupedOptions.flatMap((group) => group.children),
    ];
    if (!allOptions) return true;
    const optionsWithDataValues = allOptions?.filter(
      (option) => option?.data.val,
    );
    if (optionsWithDataValues?.length) return true;
    return this.createError({
      path: "fn",
      message: "At least one option must also set a data field",
    });
  },
};

const uniqueLabelsTest: TestConfig<AnyChecklist> = {
  name: "uniqueLabels",
  test: function ({ options }) {
    if (!options) return true;
    const uniqueLabels = new Set(options.map(({ data: { text } }) => text));
    const allUnique = uniqueLabels.size === options.length;
    if (allUnique) return true;
    return this.createError({
      path: "options",
      message: "Options must have unique labels",
    });
  },
};

const uniqueLabelsWithinGroupsTest: TestConfig<AnyChecklist> = {
  name: "uniqueLabelsWithinGroups",
  test: function ({ groupedOptions }) {
    if (!groupedOptions) return true;

    for (const group of groupedOptions) {
      if (!group.children) continue;

      const uniqueLabels = new Set(
        group.children.map(({ data: { text } }) => text),
      );
      const allUnique = uniqueLabels.size === group.children.length;

      if (!allUnique) {
        return this.createError({
          path: "options",
          message: "Options within a single group must have unique labels",
        });
      }
    }

    return true;
  },
};

const uniqueGroupTitlesTest: TestConfig<AnyChecklist> = {
  name: "uniqueGroupTitles",
  test: function ({ groupedOptions }) {
    if (!groupedOptions) return true;

    const uniqueGroupTitles = new Set(groupedOptions.map(({ title }) => title));

    const allUnique = uniqueGroupTitles.size === groupedOptions.length;

    if (!allUnique) {
      return this.createError({
        path: "options",
        message: "Groups must have unique titles",
      });
    }

    return true;
  },
};

export const baseChecklistValidationSchema =
  baseNodeDataValidationSchema.concat(
    object({
      description: richText(),
      fn: string().nullable(),
      text: string(),
      img: string(),
      categories: array(
        object({
          title: string().trim().required(),
          count: number().required(),
        }),
      ),
    })
      // Shared BaseChecklist tests
      // Casting is required for Yup, tests themselves are correctly typed
      .test(onlyOneExclusiveOptionTest as TestConfig<unknown>)
      .test(atLeastOneDataFieldTest as TestConfig<unknown>)
      .test(uniqueLabelsTest as TestConfig<unknown>)
      .test(uniqueLabelsWithinGroupsTest as TestConfig<unknown>)
      .test(uniqueGroupTitlesTest as TestConfig<unknown>),
  );

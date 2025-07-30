import { richText } from "lib/yupExtensions";
import { partition } from "lodash";
import { array, boolean, mixed, number, object, SchemaOf, string } from "yup";

import { BaseNodeData, baseNodeDataValidationSchema, Option } from "../shared";

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
  alwaysAutoAnswerBlank?: boolean;
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
  // Cannot use type FieldValidationSchema<ChecklistInput> as this is a simplified representation (i.e. no groups)
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

const optionValidationSchema = object({
  id: string(),
  data: object({
    description: string(),
    flags: array(string()),
    img: string(),
    text: string().required(),
    val: string(),
    exclusive: mixed().oneOf([true, undefined]),
  }),
});

export const validationSchema = baseNodeDataValidationSchema.concat(
  object({
    description: richText(),
    groupedOptions: array(
      object({
        title: string().required("Section title is a required field"),
        children: array(optionValidationSchema).required(),
      }).required(),
    ).optional(),
    allRequired: boolean(),
    options: array(optionValidationSchema).optional(),
    fn: string().nullable(),
    text: string(),
    img: string(),
    categories: array(
      object({
        title: string(),
        count: number(),
      }),
    ),
    neverAutoAnswer: boolean(),
    alwaysAutoAnswerBlank: boolean(),
    autoAnswers: array(string()),
  })
    .test({
      name: "notExclusiveAndAllRequired",
      test: function ({ allRequired, options }) {
        if (!allRequired) return true;

        const exclusiveOptions = options?.filter(({ data }) => data.exclusive);

        if (!exclusiveOptions || !exclusiveOptions.length) return true;

        return this.createError({
          path: "allRequired",
          message:
            'Cannot configure exclusive "or" option alongside "all required" setting',
        });
      },
    })
    .test({
      name: "onlyOneExclusiveOption",
      test: function ({ options }) {
        const exclusiveOptions = options?.filter(({ data }) => data.exclusive);

        if (!exclusiveOptions?.length) return true;
        if (exclusiveOptions.length === 1) return true;

        return this.createError({
          path: "options",
          message:
            "There should be a maximum of one exclusive option configured",
        });
      },
    })
    .test({
      name: "atLeastOneDataField",
      test: function ({ fn, options, groupedOptions }) {
        if (!fn) return true;
        const allOptions =
          options || groupedOptions?.flatMap((group) => group.children);

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
    })
    .test({
      name: "",
      test: function ({ alwaysAutoAnswerBlank, fn }) {
        if (!alwaysAutoAnswerBlank) return true;
        if (fn) return true;

        return this.createError({
          path: "alwaysAutoAnswerBlank",
          message:
            "Set a data field for the Checklist and all options but one when never putting to user",
        });
      },
    })
    .test({
      name: "onlyOneBlank",
      test: function ({ alwaysAutoAnswerBlank, options, groupedOptions, fn }) {
        if (!alwaysAutoAnswerBlank || !fn) return true;

        const allOptions =
          options || groupedOptions?.flatMap((group) => group.children);

        if (!allOptions) return true;

        const optionsWithoutDataValues = allOptions?.filter(
          (option) => !option?.data.val,
        );

        if (optionsWithoutDataValues.length === 1) return true;

        return this.createError({
          path: "alwaysAutoAnswerBlank",
          message:
            "Exactly one option should have a blank data field when never putting to user",
        });
      },
    }),
);

import { array, boolean, object, string } from "yup";

import {
  type ConditionalOption,
  Option,
  optionValidationSchema,
} from "../Option/model";
import {
  BaseChecklist,
  baseChecklistValidationSchema,
  FlatOptions,
  getFlatOptions,
  GroupedOptions,
  parseBaseChecklist,
} from "../shared/BaseChecklist/model";

/**
 * Database representation of a Checklist component
 */
export interface Checklist extends BaseChecklist {
  allRequired?: boolean;
  neverAutoAnswer?: boolean;
  alwaysAutoAnswerBlank?: boolean;
}

export type FlatChecklist = Checklist & FlatOptions<Option>;
export type GroupedChecklist = Checklist & GroupedOptions<Option>;

/**
 * Public and Editor representation of a Checklist
 * Contains options derived from child Answer nodes
 */
export type ChecklistWithOptions = FlatChecklist | GroupedChecklist;

export const checklistInputValidationSchema = ({
  data: { allRequired, options, groupedOptions },
  required,
}: {
  // Cannot use type FieldValidationSchema<ChecklistInput> as this is a simplified representation (i.e. no groups)
  data: ChecklistWithOptions;
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

export const validationSchema = baseChecklistValidationSchema.concat(
  object({
    groupedOptions: array(
      object({
        title: string().required("Section title is a required field").trim(),
        children: array(optionValidationSchema).required(),
      }).required(),
    ).optional(),
    allRequired: boolean(),
    options: array(optionValidationSchema).optional(),
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
      name: "",
      test: function (value) {
        const { alwaysAutoAnswerBlank, fn } = value as ChecklistWithOptions;
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
      test: function (value) {
        const {
          alwaysAutoAnswerBlank,
          options = [],
          groupedOptions = [],
          fn,
        } = value as ChecklistWithOptions;

        if (!alwaysAutoAnswerBlank || !fn) return true;

        const allOptions = [
          ...options,
          ...groupedOptions.flatMap((group) => group.children),
        ];

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

export const parseChecklist = (
  data: Record<string, any> | undefined,
): ChecklistWithOptions => ({
  allRequired: data?.allRequired || false,
  neverAutoAnswer: data?.neverAutoAnswer || false,
  alwaysAutoAnswerBlank: data?.alwaysAutoAnswerBlank || false,
  groupedOptions: data?.groupedOptions,
  options: data?.options,
  ...parseBaseChecklist(data),
});

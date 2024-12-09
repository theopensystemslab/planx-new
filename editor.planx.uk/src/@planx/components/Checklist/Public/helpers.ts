import { type Group } from "@planx/components/Checklist/model";
import { Store } from "pages/FlowEditor/lib/store";

import { Option } from "../../shared";

export function toggleInArray<T>(value: T, arr: Array<T>): Array<T> {
  return arr.includes(value)
    ? arr.filter((val) => val !== value)
    : [...arr, value];
}

export function groupHasOptionSelected(
  group: Group<Option>,
  answers: string[],
) {
  return group.children.some((child) => answers.some((id) => child.id === id));
}

export function getInitialExpandedGroups(
  groupedOptions?: Array<Group<Option>>,
  previouslySubmittedData?: Store.UserData,
) {
  return (groupedOptions ?? ([] as Group<Option>[])).reduce(
    (acc, group, index) =>
      groupHasOptionSelected(group, previouslySubmittedData?.answers ?? [])
        ? [...acc, index]
        : acc,
    [] as number[],
  );
}

/**
 * Reorders the options array by moving the exclusive option to the end.
 *
 * @param {Option[]} currentOptions - The array of options to reorder.
 * @param {string} exclusiveOptionText - The text of the exclusive option to move to the end.
 * @returns {Option[]} A new array with the exclusive option moved to the end.
 *
 * @description
 * This function reorders the given array of options by identifying the option with the specified
 * text and moving it to the end of the array. It maintains the relative order of all other options.
 *
 * @example
 * const options = [
 *   { id: "opt1", data: { text: "Option 1" }, type: 100 },
 *   { id: "opt2", data: { text: "Exclusive Option" }, type: 200 },
 *   { id: "opt3", data: { text: "Option 3" }, type: 300 }
 * ];
 *
 * const reorderedOptions = reorderOptions(options, "Exclusive Option");
 * console.log(reorderedOptions);
 * Output:
 * [
 *   { id: "opt1", data: { text: "Option 1" }, type: 100 },
 *   { id: "opt3", data: { text: "Option 3" }, type: 300 },
 *   { id: "opt2", data: { text: "Exclusive Option" }, type: 200 }
 * ]
 */
export const reorderOptions = (
  currentOptions: Option[],
  exclusiveOptionText: string,
): Option[] => {
  const reorderedOptions = [...currentOptions];
  const indexOfExclusiveOption = reorderedOptions.findIndex(
    (option: Option) => option.data.text === exclusiveOptionText,
  );
  if (indexOfExclusiveOption !== -1) {
    const removedItem = reorderedOptions.splice(indexOfExclusiveOption, 1)[0];
    reorderedOptions.push(removedItem);
  }
  return reorderedOptions;
};

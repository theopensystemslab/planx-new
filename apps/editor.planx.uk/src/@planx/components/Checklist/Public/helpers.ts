import { AnyOption, AnyOptions } from "@planx/components/Option/model";
import { OptionGroup } from "@planx/components/shared/BaseChecklist/model";
import { partition } from "lodash";
import { Store } from "pages/FlowEditor/lib/store";

export function toggleInArray<T>(value: T, arr: Array<T>): Array<T> {
  return arr.includes(value)
    ? arr.filter((val) => val !== value)
    : [...arr, value];
}

export function groupHasOptionSelected(group: OptionGroup, answers: string[]) {
  return group.children.some((child) => answers.some((id) => child.id === id));
}

export function getInitialExpandedGroups(
  groupedOptions?: OptionGroup[],
  previouslySubmittedData?: Store.UserData,
) {
  return (groupedOptions ?? []).reduce(
    (acc, group, index) =>
      groupHasOptionSelected(group, previouslySubmittedData?.answers ?? [])
        ? [...acc, index]
        : acc,
    [] as number[],
  );
}

export const toggleCheckbox = (
  thisCheckboxId: string,
  currentlyCheckedOptionIds: string[],
  nonExclusiveOptions: AnyOptions,
) => {
  const matchById = (id: string) => id === thisCheckboxId;

  const matchByLabelAndDataValue = (currentId: string) => {
    const selectedOption = nonExclusiveOptions.find(
      ({ id }) => id === thisCheckboxId,
    );

    // Type narrowing - there will always be a selected option
    if (!selectedOption) {
      throw Error(`Selected option with id ${thisCheckboxId} not found`);
    }

    const {
      data: { text: selectedLabel, val: selectedVal },
    } = selectedOption;

    if (!selectedVal) return false;

    const currentOption = nonExclusiveOptions.find(
      ({ id }) => id === currentId,
    );

    // Current option must be the exclusive option
    if (!currentOption) return false;

    const {
      data: { text: currentLabel, val: currentVal },
    } = currentOption;

    const isMatch =
      currentLabel === selectedLabel && currentVal === selectedVal;
    return isMatch;
  };

  const toggleOff = currentlyCheckedOptionIds
    // Remove current
    .filter((id) => !matchById(id))
    // Remove matches
    .filter((id) => !matchByLabelAndDataValue(id));

  const matches = nonExclusiveOptions
    .map(({ id }) => id)
    .filter(matchByLabelAndDataValue);

  const toggleOn = [
    ...new Set([
      // Retain existing
      ...currentlyCheckedOptionIds,
      // Add current
      thisCheckboxId,
      // Add matches
      ...matches,
    ]),
  ];

  return currentlyCheckedOptionIds.includes(thisCheckboxId)
    ? toggleOff
    : toggleOn;
};

export const toggleNonExclusiveCheckbox = (
  thisCheckboxId: string,
  currentlyCheckedOptionIds: string[],
  exclusiveOrOption: AnyOption,
  nonExclusiveOptions: AnyOptions,
) => {
  const newCheckedOptionIds = toggleCheckbox(
    thisCheckboxId,
    currentlyCheckedOptionIds,
    nonExclusiveOptions,
  );
  if (exclusiveOrOption) {
    return newCheckedOptionIds.filter(
      (id: string) => exclusiveOrOption && id !== exclusiveOrOption.id,
    );
  }
  return newCheckedOptionIds;
};

export const partitionGroupedOptions = (
  groupedOptions: OptionGroup[],
): OptionGroup[][] => {
  const [exclusiveOptionGroup, nonExclusiveOptionGroups] = partition(
    groupedOptions,
    (group) =>
      group.exclusive ||
      group.children.some((child) => child.data.exclusive === true),
  );
  return [exclusiveOptionGroup, nonExclusiveOptionGroups];
};

export const changeCheckbox =
  ({
    id,
    setCheckedFieldValue,
    currentCheckedIds,
    exclusiveOrOption,
    toggleExclusiveCheckbox,
    nonExclusiveOptions,
  }: {
    id: string;
    setCheckedFieldValue: (optionIds: string[]) => void;
    currentCheckedIds: string[];
    exclusiveOrOption: AnyOption;
    toggleExclusiveCheckbox: (checkboxId: string) => string[];
    nonExclusiveOptions: AnyOptions;
  }) =>
  () => {
    const currentCheckboxIsExclusiveOption =
      exclusiveOrOption && id === exclusiveOrOption.id;

    if (currentCheckboxIsExclusiveOption) {
      const newCheckedIds = toggleExclusiveCheckbox(id);
      setCheckedFieldValue(newCheckedIds);
      return;
    }
    const newCheckedIds = toggleNonExclusiveCheckbox(
      id,
      currentCheckedIds,
      exclusiveOrOption,
      nonExclusiveOptions,
    );
    setCheckedFieldValue(newCheckedIds);
  };

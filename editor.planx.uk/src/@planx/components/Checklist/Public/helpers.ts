import { type Group } from "@planx/components/Checklist/model";
import { partition } from "lodash";
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

export const toggleCheckbox = (
  thisCheckboxId: string,
  currentlyCheckedOptionIds: string[],
  nonExclusiveOptions: Option[],
) => {
  const matchById = (id: string) => id === thisCheckboxId;

  const matchByLabelAndDataValue = (currentId: string) => {
    const selectedOption = nonExclusiveOptions.find(
      ({ id }) => id === thisCheckboxId,
    );
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
    if (!currentOption) {
      throw Error(`Current option with id ${currentId} not found`);
    }

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
  exclusiveOrOption: Option,
  nonExclusiveOptions: Option[],
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
  groupedOptions: Group<Option>[],
): Group<Option>[][] => {
  const [exclusiveOptionGroup, nonExclusiveOptionGroups] = partition(
    groupedOptions,
    (group: Group<Option>) =>
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
    exclusiveOrOption: Option;
    toggleExclusiveCheckbox: (checkboxId: string) => string[];
    nonExclusiveOptions: Option[];
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

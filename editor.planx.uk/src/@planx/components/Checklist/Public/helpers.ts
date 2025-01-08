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
) => {
  const toggleOff = currentlyCheckedOptionIds.filter(
    (id) => id !== thisCheckboxId,
  );

  const toggleOn = [...currentlyCheckedOptionIds, thisCheckboxId];

  return currentlyCheckedOptionIds.includes(thisCheckboxId)
    ? toggleOff
    : toggleOn;
};

export const toggleNonExclusiveCheckbox = (
  thisCheckboxId: string,
  currentlyCheckedOptionIds: string[],
  exclusiveOrOption: Option,
) => {
  const newCheckedOptionIds = toggleCheckbox(
    thisCheckboxId,
    currentlyCheckedOptionIds,
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
  }: {
    id: string;
    setCheckedFieldValue: (optionIds: string[]) => void;
    currentCheckedIds: string[];
    exclusiveOrOption: Option;
    toggleExclusiveCheckbox: (checkboxId: string) => string[];
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
    );
    setCheckedFieldValue(newCheckedIds);
  };

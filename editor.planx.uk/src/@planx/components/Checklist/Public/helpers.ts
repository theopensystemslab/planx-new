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
  answers: string[]
) {
  return group.children.some((child) => answers.some((id) => child.id === id));
}

export function getInitialExpandedGroups(
  groupedOptions?: Array<Group<Option>>,
  previouslySubmittedData?: Store.UserData
) {
  return (groupedOptions ?? ([] as Group<Option>[])).reduce(
    (acc, group, index) =>
      groupHasOptionSelected(group, previouslySubmittedData?.answers ?? [])
        ? [...acc, index]
        : acc,
    [] as number[]
  );
}

export const toggleCheckbox = (
  thisCheckboxId: string,
  currentlyCheckedOptionIds: string[]
) => {
  const toggleOff = currentlyCheckedOptionIds.filter(
    (id) => id !== thisCheckboxId
  );

  const toggleOn = [...currentlyCheckedOptionIds, thisCheckboxId];

  return currentlyCheckedOptionIds.includes(thisCheckboxId)
    ? toggleOff
    : toggleOn;
};

export const toggleNonExclusiveCheckbox = (
  thisCheckboxId: string,
  currentlyCheckedOptionIds: string[],
  exclusiveOrOption: Option
) => {
  const newCheckedOptionIds = toggleCheckbox(
    thisCheckboxId,
    currentlyCheckedOptionIds
  );
  return newCheckedOptionIds.filter(
    (id: string) => exclusiveOrOption && id !== exclusiveOrOption.id
  );
};

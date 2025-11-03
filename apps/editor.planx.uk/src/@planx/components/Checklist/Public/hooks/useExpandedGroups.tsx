import { Group } from "@planx/components/Checklist/model";
import { Option } from "@planx/components/Option/model";
import { Store } from "pages/FlowEditor/lib/store";
import { useState } from "react";

import { getInitialExpandedGroups, toggleInArray } from "../helpers";

export const useExpandedGroups = (
  groupedOptions: Group<Option>[] | undefined,
  previouslySubmittedData: Store.UserData | undefined
) => {
  const initialExpandedGroups = getInitialExpandedGroups(
    groupedOptions,
    previouslySubmittedData
  );

  const [expandedGroups, setExpandedGroups] = useState<Array<number>>(
    initialExpandedGroups
  );

  const toggleGroup = (index: number) => {
    setExpandedGroups((previous) => toggleInArray(index, previous));
  };

  return { expandedGroups, toggleGroup };
};

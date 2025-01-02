import React from "react";

import { PublicChecklistProps } from "../../types";
import { GroupedChecklist } from "./grouped/GroupedChecklist";
import { Checklist } from "./nonGrouped/Checklist";

export enum ChecklistLayout {
  Basic,
  Grouped,
  Images,
}

export const VisibleChecklist: React.FC<PublicChecklistProps> = (props) => {
  const { groupedOptions, options } = props;

  return (
    <>
      {groupedOptions && <GroupedChecklist {...props} />}
      {options && <Checklist {...props} />}
    </>
  );
};

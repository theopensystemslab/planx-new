import React from "react";

import { PublicChecklistProps } from "../types";
import { Checklist } from "./components/Checklist";
import { GroupedChecklist } from "./components/grouped/GroupedChecklist";

const ChecklistComponent: React.FC<PublicChecklistProps> = (props) => {
  const { groupedOptions, options } = props;

  return (
    <>
      {groupedOptions && <GroupedChecklist {...props} />}
      {options && <Checklist {...props} />}
    </>
  );
};

export default ChecklistComponent;

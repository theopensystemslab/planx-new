import { PublicProps } from "@planx/components/shared/types";
import React from "react";

import FlatChecklist from "../shared/BaseChecklist/Public/components/FlatChecklist";
import GroupedChecklist from "../shared/BaseChecklist/Public/components/GroupedChecklist";
import type { ChecklistWithOptions } from "./model";

const ChecklistComponent: React.FC<PublicProps<ChecklistWithOptions>> = (
  props,
) => {
  const { groupedOptions, options } = props;

  // Do not display component if there are no options
  // It's being used as a "sticky note" in the graph by editors
  const isStickyNote = !groupedOptions?.length && !options?.length;
  if (isStickyNote) return null;

  return (
    <>
      {groupedOptions && <GroupedChecklist {...props} />}
      {options && <FlatChecklist {...props} />}
    </>
  );
};

export default ChecklistComponent;

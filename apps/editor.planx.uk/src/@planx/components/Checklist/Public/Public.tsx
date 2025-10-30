import { PublicProps } from "@planx/components/shared/types";
import React from "react";

import type { ChecklistWithOptions } from "../model";
import { FlatChecklist } from "./components/FlatChecklist";
import { GroupedChecklist } from "./components/GroupedChecklist";

const ChecklistComponent: React.FC<PublicProps<ChecklistWithOptions>> = (
  props,
) => {
  const { groupedOptions, options } = props;

  return (
    <>
      {groupedOptions && <GroupedChecklist {...props} />}
      {options && <FlatChecklist {...props} />}
    </>
  );
};

export default ChecklistComponent;

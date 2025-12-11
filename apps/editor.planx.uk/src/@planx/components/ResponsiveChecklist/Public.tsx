import { PublicProps } from "@planx/components/shared/types";
import React from "react";

import FlatChecklist from "../shared/BaseChecklist/Public/components/FlatChecklist";
import GroupedChecklist from "../shared/BaseChecklist/Public/components/GroupedChecklist";
import { useConditionalOptions } from "../shared/RuleBuilder/hooks/useConditionalResponses";
import type { ResponsiveChecklistWithOptions } from "./model";

const ResponsiveChecklistComponent: React.FC<
  PublicProps<ResponsiveChecklistWithOptions>
> = (props) => {
  const { options, groupedOptions, ...restProps } = props;
  const { conditionalOptions, groupedConditionalOptions } =
    useConditionalOptions(options, groupedOptions);

  // Skip component if no options to show user
  if (!groupedConditionalOptions && !conditionalOptions) {
    props.handleSubmit?.({ auto: true });
    return null;
  }

  if (groupedConditionalOptions) {
    return (
      <GroupedChecklist
        {...restProps}
        groupedOptions={groupedConditionalOptions}
      />
    );
  }

  if (conditionalOptions) {
    return <FlatChecklist {...restProps} options={conditionalOptions} />;
  }
};

export default ResponsiveChecklistComponent;

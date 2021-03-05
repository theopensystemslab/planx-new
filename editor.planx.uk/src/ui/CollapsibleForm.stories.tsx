import Typography from "@material-ui/core/Typography";
import { Meta, Story } from "@storybook/react/types-6-0";
import { submitFeedback } from "lib/feedback";
import React from "react";

import CollapsibleForm, { Props } from "./CollapsibleForm";

const metadata: Meta = {
  title: "Design System/Molecules/CollapsibleForm",
  component: CollapsibleForm,
};

export const Basic: Story<Props> = (args: Props) => (
  <CollapsibleForm
    {...args}
    onSubmit={(text) => submitFeedback("b929227ff0690e", text)}
  >
    <Typography variant="body2">
      Is this result inaccurate? <b>tell us why</b>
    </Typography>
  </CollapsibleForm>
);

export default metadata;

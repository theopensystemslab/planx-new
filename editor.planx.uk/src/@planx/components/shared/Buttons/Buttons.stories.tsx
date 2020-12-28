import Box from "@material-ui/core/Box";
import { Meta, Story } from "@storybook/react/types-6-0";
import React from "react";

import ButtonBase from "./ButtonBase";
import DecisionButton, { Props as DecisionButtonProps } from "./DecisionButton";
import DescriptionButton, {
  Props as DescriptionButtonProps,
} from "./DescriptionButton";
import ImageButton, { Props as ImageButtonProps } from "./ImageButton";

const metadata: Meta = {
  title: "Design System/Atoms/Buttons",
  parameters: {
    backgrounds: {
      default: "dark",
    },
  },
  component: ButtonBase,
  decorators: [
    (Story) => (
      <Box maxWidth={300}>
        <Story />
      </Box>
    ),
  ],
};

export const Image: Story<ImageButtonProps> = (args) => (
  <ImageButton {...args} />
);
Image.args = {
  id: "a",
  responseKey: "a",
  title: "Apple",
  img:
    "https://i2.wp.com/ceklog.kindel.com/wp-content/uploads/2013/02/firefox_2018-07-10_07-50-11.png",
};

export const MissingImage: Story<ImageButtonProps> = (args) => (
  <ImageButton {...args} />
);
MissingImage.args = {
  id: "a",
  responseKey: "a",
  title: "Apple",
  img: "",
};

export const Decision: Story<DecisionButtonProps> = (args) => (
  <DecisionButton {...args} />
);
Decision.args = {
  id: "a",
  responseKey: "a",
  title: "Apple",
};

export const Description: Story<DescriptionButtonProps> = (args) => (
  <DescriptionButton {...args} />
);
Description.args = {
  id: "a",
  responseKey: "a",
  title: "Apple",
  description: "A delicious fruit",
};

export const MissingDescription: Story<DescriptionButtonProps> = (args) => (
  <DescriptionButton {...args} />
);
MissingDescription.args = {
  id: "a",
  responseKey: "a",
  title: "Apple",
};

export default metadata;

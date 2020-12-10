import Box from "@material-ui/core/Box";
import { Meta } from "@storybook/react/types-6-0";
import React, { useState } from "react";

import DecisionButton from "./DecisionButton";
import DescriptionButton from "./DescriptionButton";
import ImageButton from "./ImageButton";

const Wrapper = (Story, props) => {
  const [selected, setSelected] = useState<boolean>();

  return (
    <Box maxWidth={300}>
      <Story
        args={{
          selected,
          onClick: () => setSelected(!selected),
          ...props.args,
        }}
      />
    </Box>
  );
};

const metadata: Meta = {
  title: "Design System/Atoms/Buttons",
  parameters: {
    backgrounds: {
      default: "dark",
    },
  },
  decorators: [Wrapper],
};

export const Image = (args) => <ImageButton {...args} />;
Image.args = {
  response: {
    id: "a",
    responseKey: "a",
    title: "Apple",
    img:
      "https://i2.wp.com/ceklog.kindel.com/wp-content/uploads/2013/02/firefox_2018-07-10_07-50-11.png",
  },
};

export const MissingImage = (args) => <ImageButton {...args} />;
MissingImage.args = {
  response: {
    id: "a",
    responseKey: "a",
    title: "Apple",
    img: "",
  },
};

export const Decision = (args) => <DecisionButton {...args} />;
Decision.args = {
  response: {
    id: "a",
    responseKey: "a",
    title: "Apple",
  },
};

export const Description = (args) => <DescriptionButton {...args} />;
Description.args = {
  response: {
    id: "a",
    responseKey: "a",
    title: "Apple",
    description: "A delicious fruit",
  },
};

export const MissingDescription = (args) => <DescriptionButton {...args} />;
MissingDescription.args = {
  response: {
    id: "a",
    responseKey: "a",
    title: "Apple",
  },
};

export default metadata;

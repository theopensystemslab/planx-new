import Box from "@material-ui/core/Box";
import { Meta } from "@storybook/react/types-6-0";
import React from "react";

import ImageResponse, { Props } from "./ImageResponse";

const metadata: Meta = {
  title: "Design System/Atoms/Responses/ImageResponse",
  component: ImageResponse,
  argTypes: {
    selected: { control: "boolean" },
  },
  parameters: {
    backgrounds: {
      default: "dark",
    },
  },
};

export const Basic = (args) => (
  <Box maxWidth={300}>
    <ImageResponse {...args} />
  </Box>
);

export default metadata;

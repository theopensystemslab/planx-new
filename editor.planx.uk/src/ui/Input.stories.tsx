import { Meta } from "@storybook/react";

import Input from "./Input";

const metadata: Meta = {
  title: "Design System/Atoms/Form Elements/Input",
  component: Input,
};

export const Basic = {
  args: {
    bordered: false,
  },
};

export const WithError = {
  args: {
    bordered: true,
    errorMessage: "WRONG YOU'RE SIMPLY WRONG",
  },
};

export const Multiline = {
  args: {
    bordered: true,
    multiline: true,
  },
};

export default metadata;

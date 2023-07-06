import { Meta } from "@storybook/react";
import InputField from "ui/InputField";

const metadata: Meta = {
  title: "Design System/Atoms/Form Elements/InputField",
  component: InputField,
};

export const Basic = {
  args: {
    name: "Text",
    multiline: true,
    placeholder: "Portal name",
    rows: 2,
    disabled: false,
    required: false,
  },
};

export default metadata;

import { Meta, StoryObj } from "@storybook/react";

import FileDownload from "./FileDownload";

const meta = {
  title: "Design System/Atoms/Form Elements/FileDownload",
  component: FileDownload,
} satisfies Meta<typeof FileDownload>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  args: {
    filename: "application.csv",
    data: [
      {
        question: "What are you applying about?",
        responses: "Works to trees",
        metadata: { section_name: "About your project" },
      },
    ],
    text: "Download your application (.csv)",
  },
} satisfies Story;

import { type Editor } from "@tiptap/core";

import { ToolbarButton } from "./RichTextInputButtons";

const HeadingButton = ({
  editor,
  level,
  label,
  tooltip,
  isActive,
}: {
  editor: Editor;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  isActive: boolean;
  label: React.ReactNode;
  tooltip: string;
}) => (
  <ToolbarButton
    label={tooltip}
    isActive={isActive}
    onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
  >
    {label}
  </ToolbarButton>
);

export const H1Button = ({
  editor,
  label,
  isActive,
}: {
  editor: Editor;
  label: React.ReactNode;
  isActive: boolean;
}) => {
  return (
    <HeadingButton
      editor={editor}
      isActive={isActive}
      level={1}
      label={label}
      tooltip="Heading"
    />
  );
};

export const H2Button = ({
  editor,
  label,
  isActive,
}: {
  editor: Editor;
  label: React.ReactNode;
  isActive: boolean;
}) => {
  return (
    <HeadingButton
      editor={editor}
      level={2}
      isActive={isActive}
      label={label}
      tooltip="Subheading"
    />
  );
};

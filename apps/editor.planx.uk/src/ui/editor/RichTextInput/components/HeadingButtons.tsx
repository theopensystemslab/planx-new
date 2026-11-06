import { type Editor } from "@tiptap/core";

import { ToolbarButton } from "./RichTextInputButtons";

const HeadingButton = ({
  editor,
  level,
  label,
  tooltip,
}: {
  editor: Editor;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  label: React.ReactNode;
  tooltip: string;
}) => (
  <ToolbarButton
    label={tooltip}
    isActive={editor.isActive("heading", { level })}
    onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
  >
    {label}
  </ToolbarButton>
);

export const H1Button = ({
  editor,
  label,
}: {
  editor: Editor;
  label: React.ReactNode;
}) => {
  return (
    <HeadingButton editor={editor} level={1} label={label} tooltip="Heading" />
  );
};

export const H2Button = ({
  editor,
  label,
}: {
  editor: Editor;
  label: React.ReactNode;
}) => {
  return (
    <HeadingButton
      editor={editor}
      level={2}
      label={label}
      tooltip="Subheading"
    />
  );
};

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
    onClick={() =>
      editor
        .chain()
        .focus()
        .toggleHeading({ level })
        // Headings are already bold, so remove any bold text within them
        // Applied to the whole of each block, not just the selected text
        .command(({ tr, state }) => {
          if (isActive) return true;
          const { $from, $to } = state.selection;
          tr.removeMark($from.start(), $to.end(), state.schema.marks.bold);
          return true;
        })
        .run()
    }
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

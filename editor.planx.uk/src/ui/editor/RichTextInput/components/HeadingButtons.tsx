import IconButton from "@mui/material/IconButton";
import { type Editor } from "@tiptap/core";
import React from "react";

const HeadingButton = ({
  editor,
  level,
  label,
}: {
  editor: Editor;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  label: React.ReactNode;
}) => (
  <IconButton
    size="small"
    color={editor.isActive("heading", { level }) ? "primary" : undefined}
    onClick={() => {
      editor.chain().focus().toggleHeading({ level }).run();
    }}
  >
    {label}
  </IconButton>
);

export const H1Button = ({
  editor,
  label,
}: {
  editor: Editor;
  label: React.ReactNode;
}) => {
  return <HeadingButton editor={editor} level={1} label={label} />;
};

export const H2Button = ({
  editor,
  label,
}: {
  editor: Editor;
  label: React.ReactNode;
}) => {
  return <HeadingButton editor={editor} level={2} label={label} />;
};

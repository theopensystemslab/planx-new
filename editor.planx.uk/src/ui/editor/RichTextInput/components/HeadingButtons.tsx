import IconButton from "@mui/material/IconButton";
import { type Editor } from "@tiptap/core";
import { Level } from "@tiptap/extension-heading";
import React from "react";

const HeadingButton = ({
  editor,
  level,
}: {
  editor: Editor;
  level: number;
}) => (
  <IconButton
    size="small"
    color={editor.isActive("heading", { level }) ? "primary" : undefined}
    onClick={() => {
      editor
        .chain()
        .focus()
        .toggleHeading({ level: level as Level })
        .run();
    }}
  >
    <strong>`H${level}</strong>
  </IconButton>
);

export const H1Button = ({ editor }: { editor: Editor }) => {
  return <HeadingButton editor={editor} level={1} />;
};

export const H2Button = ({ editor }: { editor: Editor }) => {
  return <HeadingButton editor={editor} level={2} />;
};

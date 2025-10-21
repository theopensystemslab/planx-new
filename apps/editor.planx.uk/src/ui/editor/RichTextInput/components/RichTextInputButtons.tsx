import FormatBold from "@mui/icons-material/FormatBold";
import FormatItalic from "@mui/icons-material/FormatItalic";
import FormatListBulleted from "@mui/icons-material/FormatListBulleted";
import FormatListNumbered from "@mui/icons-material/FormatListNumbered";
import IconButton from "@mui/material/IconButton";
import { type Editor } from "@tiptap/core";
import React, { ReactElement } from "react";

const RichTextInputButton = ({
  editor,
  type,
  onClick,
  icon,
}: {
  editor: Editor;
  type: string;
  onClick: () => void;
  icon: ReactElement;
}) => {
  return (
    <IconButton
      size="small"
      color={editor.isActive(type) ? "primary" : undefined}
      onClick={onClick}
    >
      {icon}
    </IconButton>
  );
};

export const BoldButton = ({ editor }: { editor: Editor }) => (
  <RichTextInputButton
    editor={editor}
    type="bold"
    icon={<FormatBold />}
    onClick={() => {
      editor.chain().focus().toggleBold().run();
    }}
  />
);

export const ItalicButton = ({ editor }: { editor: Editor }) => (
  <RichTextInputButton
    editor={editor}
    type="italic"
    icon={<FormatItalic />}
    onClick={() => {
      editor.chain().focus().toggleItalic().run();
    }}
  />
);

export const BulletListButton = ({ editor }: { editor: Editor }) => (
  <RichTextInputButton
    editor={editor}
    type="bulletList"
    icon={<FormatListBulleted />}
    onClick={() => {
      editor.chain().focus().toggleBulletList().run();
    }}
  />
);

export const OrderedListButton = ({ editor }: { editor: Editor }) => (
  <RichTextInputButton
    editor={editor}
    type="orderedList"
    icon={<FormatListNumbered />}
    onClick={() => {
      editor.chain().focus().toggleOrderedList().run();
    }}
  />
);

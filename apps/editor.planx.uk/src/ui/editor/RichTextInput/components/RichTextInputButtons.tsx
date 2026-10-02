import IconButton from "@mui/material/IconButton";
import {
  IconBold,
  IconItalic,
  IconListFilled,
  IconListNumbers,
} from "@tabler/icons-react";
import { type Editor } from "@tiptap/core";
import type { ReactElement } from "react";
import { Icon } from "ui/icons/Icon";

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
    icon={<Icon icon={IconBold} />}
    onClick={() => {
      editor.chain().focus().toggleBold().run();
    }}
  />
);

export const ItalicButton = ({ editor }: { editor: Editor }) => (
  <RichTextInputButton
    editor={editor}
    type="italic"
    icon={<Icon icon={IconItalic} />}
    onClick={() => {
      editor.chain().focus().toggleItalic().run();
    }}
  />
);

export const BulletListButton = ({ editor }: { editor: Editor }) => (
  <RichTextInputButton
    editor={editor}
    type="bulletList"
    icon={<Icon icon={IconListFilled} />}
    onClick={() => {
      editor.chain().focus().toggleBulletList().run();
    }}
  />
);

export const OrderedListButton = ({ editor }: { editor: Editor }) => (
  <RichTextInputButton
    editor={editor}
    type="orderedList"
    icon={<Icon icon={IconListNumbers} />}
    onClick={() => {
      editor.chain().focus().toggleOrderedList().run();
    }}
  />
);

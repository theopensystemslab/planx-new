import FormatBold from "@mui/icons-material/FormatBold";
import FormatItalic from "@mui/icons-material/FormatItalic";
import FormatListBulleted from "@mui/icons-material/FormatListBulleted";
import FormatListNumbered from "@mui/icons-material/FormatListNumbered";
import IconButton, { type IconButtonProps } from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { type Editor } from "@tiptap/core";
import type { ReactNode } from "react";

/**
 * Labelled icon button used within the rich text toolbar
 * Shows a tooltip on hover and exposes the same label to assistive technology
 */
export const ToolbarButton = ({
  label,
  isActive,
  children,
  ...props
}: {
  label: string;
  isActive?: boolean;
  children: ReactNode;
} & Omit<IconButtonProps, "children" | "color">) => (
  <Tooltip title={label} placement="top" describeChild>
    {/* span keeps tooltip working when the button is disabled */}
    <span>
      <IconButton
        size="small"
        aria-label={label}
        aria-pressed={isActive}
        color={isActive ? "primary" : undefined}
        {...props}
      >
        {children}
      </IconButton>
    </span>
  </Tooltip>
);

export const BoldButton = ({ editor }: { editor: Editor }) => (
  <ToolbarButton
    label="Bold"
    isActive={editor.isActive("bold")}
    onClick={() => editor.chain().focus().toggleBold().run()}
  >
    <FormatBold />
  </ToolbarButton>
);

export const ItalicButton = ({ editor }: { editor: Editor }) => (
  <ToolbarButton
    label="Italic"
    isActive={editor.isActive("italic")}
    onClick={() => editor.chain().focus().toggleItalic().run()}
  >
    <FormatItalic />
  </ToolbarButton>
);

export const BulletListButton = ({ editor }: { editor: Editor }) => (
  <ToolbarButton
    label="Bulleted list"
    isActive={editor.isActive("bulletList")}
    onClick={() => editor.chain().focus().toggleBulletList().run()}
  >
    <FormatListBulleted />
  </ToolbarButton>
);

export const OrderedListButton = ({ editor }: { editor: Editor }) => (
  <ToolbarButton
    label="Numbered list"
    isActive={editor.isActive("orderedList")}
    onClick={() => editor.chain().focus().toggleOrderedList().run()}
  >
    <FormatListNumbered />
  </ToolbarButton>
);

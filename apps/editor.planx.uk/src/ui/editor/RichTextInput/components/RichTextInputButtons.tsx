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

/**
 * Active state is passed in (from useEditorState) rather than read via editor.isActive() during render
 * The editor instance is a stable reference, so the React Compiler would otherwise memoise a stale value
 */
interface FormatButtonProps {
  editor: Editor;
  isActive: boolean;
}

export const BoldButton = ({
  editor,
  isActive,
  disabled,
}: FormatButtonProps & { disabled?: boolean }) => (
  <ToolbarButton
    label={disabled ? "Bold (not available in headings)" : "Bold"}
    isActive={isActive && !disabled}
    disabled={disabled}
    onClick={() => editor.chain().focus().toggleBold().run()}
  >
    <FormatBold />
  </ToolbarButton>
);

export const ItalicButton = ({ editor, isActive }: FormatButtonProps) => (
  <ToolbarButton
    label="Italic"
    isActive={isActive}
    onClick={() => editor.chain().focus().toggleItalic().run()}
  >
    <FormatItalic />
  </ToolbarButton>
);

export const BulletListButton = ({ editor, isActive }: FormatButtonProps) => (
  <ToolbarButton
    label="Bulleted list"
    isActive={isActive}
    onClick={() => editor.chain().focus().toggleBulletList().run()}
  >
    <FormatListBulleted />
  </ToolbarButton>
);

export const OrderedListButton = ({ editor, isActive }: FormatButtonProps) => (
  <ToolbarButton
    label="Numbered list"
    isActive={isActive}
    onClick={() => editor.chain().focus().toggleOrderedList().run()}
  >
    <FormatListNumbered />
  </ToolbarButton>
);

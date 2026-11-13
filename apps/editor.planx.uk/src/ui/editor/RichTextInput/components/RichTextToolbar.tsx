import Check from "@mui/icons-material/Check";
import Close from "@mui/icons-material/Close";
import Delete from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import Box from "@mui/material/Box";
import { type Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import { type FC, type MouseEvent, useEffect, useRef, useState } from "react";

import Input from "../../../shared/Input/Input";
import PublicFileUploadButton from "../../../shared/PublicFileUploadButton";
import { Toolbar, ToolbarDivider } from "../styles";
import { initialUrlValue, trimUrlValue } from "../utils";
import { H1Button, H2Button } from "./HeadingButtons";
import {
  BoldButton,
  BulletListButton,
  ItalicButton,
  OrderedListButton,
  ToolbarButton,
} from "./RichTextInputButtons";

const FOCUSABLE_ELEMENTS =
  "a[href], button:not(:disabled), input:not(:disabled), select, textarea";

/**
 * Pressing on a non-focusable part of the toolbar (padding, dividers, disabled buttons) would
 * otherwise move focus to <body>, which closes the toolbar via :focus-within
 * Cancelling the mousedown keeps focus on whatever currently has it (editor or URL input)
 */
const keepFocusWithinField = (ev: MouseEvent<HTMLDivElement>) => {
  const target = ev.target as Element;
  if (!target.closest(FOCUSABLE_ELEMENTS)) ev.preventDefault();
};

interface Props {
  editor: Editor;
  showHeadings: boolean;
}

/**
 * Formatting toolbar attached to the top of a rich text field
 * Visibility is controlled by CSS (:focus-within on RichContentContainer) so that only the
 * currently focused field ever displays a toolbar
 */
export const RichTextToolbar: FC<Props> = ({ editor, showHeadings }) => {
  // Track "active" formatting at the cursor position, updating on every transaction
  // These values must be passed down as props - calling editor.isActive() during render is unsafe
  // as `editor` is a stable reference, so the React Compiler will memoise the first result
  const active = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: Boolean(editor?.isActive("bold")),
      italic: Boolean(editor?.isActive("italic")),
      bulletList: Boolean(editor?.isActive("bulletList")),
      orderedList: Boolean(editor?.isActive("orderedList")),
      h1: Boolean(editor?.isActive("heading", { level: 1 })),
      h2: Boolean(editor?.isActive("heading", { level: 2 })),
      // Any heading level, including those from pasted content
      heading: Boolean(editor?.isActive("heading")),
      link: Boolean(editor?.isActive("link")),
    }),
  });

  const [linkDraft, setLinkDraft] = useState<string | null>(null);
  const isAddingLink = linkDraft !== null;
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Close the link form if the user moves the cursor within the editor
  useEffect(() => {
    const handleSelectionUpdate = () => setLinkDraft(null);
    editor.on("selectionUpdate", handleSelectionUpdate);
    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor]);

  // Focus/select the URL input field value when it appears in the UI
  useEffect(() => {
    if (!isAddingLink) return;
    const input = urlInputRef.current;
    input?.focus();
    // Select existing URLs so they can be replaced, but leave the cursor after a bare "https://"
    if (input && input.value !== initialUrlValue) input.select();
  }, [isAddingLink]);

  const openLinkForm = () => {
    const href = editor.getAttributes("link")?.href || initialUrlValue;
    setLinkDraft(href);
  };

  const closeLinkForm = () => {
    setLinkDraft(null);
    editor.commands.focus();
  };

  const submitLink = () => {
    const href = linkDraft?.trim() ?? "";
    if (!href || href === initialUrlValue) return closeLinkForm();

    const chain = editor.chain().focus();
    if (editor.isActive("link")) {
      // Update the whole existing link, not just the text under the cursor
      chain.extendMarkRange("link").setLink({ href }).run();
    } else if (editor.state.selection.empty) {
      // Toolbar is visible without a selection, so insert the URL itself as link text
      chain
        .insertContent({
          type: "text",
          text: href,
          marks: [{ type: "link", attrs: { href } }],
        })
        .run();
    } else {
      chain.setLink({ href }).run();
    }
    setLinkDraft(null);
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkDraft(null);
  };

  return (
    <Toolbar
      className="rte-toolbar"
      role="toolbar"
      aria-label="Text formatting"
      onMouseDown={keepFocusWithinField}
    >
      {isAddingLink ? (
        <Box sx={{ display: "flex", alignItems: "center", flex: 1, gap: 0.5 }}>
          <Input
            sx={{ flex: 1, minWidth: 0, height: 36 }}
            aria-label="URL"
            ref={urlInputRef}
            value={linkDraft}
            onChange={(ev) => setLinkDraft(trimUrlValue(ev.target.value))}
            onKeyDown={(ev) => {
              if (ev.key === "Enter") {
                ev.preventDefault();
                submitLink();
              }
              if (ev.key === "Escape") {
                ev.preventDefault();
                ev.stopPropagation();
                closeLinkForm();
              }
            }}
          />
          <ToolbarButton label="Save link" onClick={submitLink}>
            <Check />
          </ToolbarButton>
          <ToolbarButton
            label="Remove link"
            disabled={!active.link}
            onClick={removeLink}
          >
            <Delete />
          </ToolbarButton>
          <ToolbarButton label="Cancel" onClick={closeLinkForm}>
            <Close />
          </ToolbarButton>
        </Box>
      ) : (
        <>
          {showHeadings && (
            <>
              <H1Button
                editor={editor}
                isActive={active.h1}
                label={<strong>H2</strong>}
              />
              <H2Button
                editor={editor}
                isActive={active.h2}
                label={<strong>H3</strong>}
              />
              <ToolbarDivider />
            </>
          )}
          {/* Headings are already bold */}
          <BoldButton
            editor={editor}
            isActive={active.bold}
            disabled={active.heading}
          />
          <ItalicButton editor={editor} isActive={active.italic} />
          <ToolbarDivider />
          <BulletListButton editor={editor} isActive={active.bulletList} />
          <OrderedListButton editor={editor} isActive={active.orderedList} />
          <ToolbarDivider />
          <PublicFileUploadButton
            variant="tooltip"
            aria-label="Insert image"
            tooltipTitle="Insert image"
            onChange={(src) => editor.chain().focus().setImage({ src }).run()}
          />
          <ToolbarButton
            label={active.link ? "Edit link" : "Add link"}
            isActive={active.link}
            onClick={openLinkForm}
          >
            <LinkIcon />
          </ToolbarButton>
        </>
      )}
    </Toolbar>
  );
};

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

const Divider = () => (
  <ToolbarDivider role="separator" aria-orientation="vertical" />
);

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

  // Opening the native file dialog blurs the window, so nothing within the field has focus and
  // :focus-within no longer matches. Hold the toolbar open until the dialog is dismissed.
  const [isPickingFile, setIsPickingFile] = useState(false);

  useEffect(() => {
    if (!isPickingFile) return;
    const controller = new AbortController();
    const done = () => setIsPickingFile(false);
    // Window regains focus once the dialog closes (with or without a file)
    window.addEventListener("focus", done, { signal: controller.signal });
    // Fallback, in case a browser does not blur the window - the dialog is modal, so any
    // interaction with the page means it has been dismissed
    for (const type of ["pointerdown", "keydown"]) {
      document.addEventListener(type, done, {
        capture: true,
        signal: controller.signal,
      });
    }
    return () => controller.abort();
  }, [isPickingFile]);

  const openFilePicker = () => {
    focusEditor();
    setIsPickingFile(true);
  };

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

  // The toolbar is only visible via :focus-within. If a focused control is removed from the DOM
  // (e.g. swapped for the link form, or a loading state), focus falls to <body>, the toolbar is
  // hidden, and nothing within it can receive focus. Move focus to the editor before any swap.
  // Note: editor.view.focus() is synchronous, unlike Tiptap's focus() command
  const focusEditor = () => editor.view.focus();

  const openLinkForm = () => {
    focusEditor();
    const href = editor.getAttributes("link")?.href || initialUrlValue;
    setLinkDraft(href);
  };

  const closeLinkForm = () => {
    focusEditor();
    setLinkDraft(null);
  };

  const submitLink = () => {
    focusEditor();
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
    focusEditor();
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkDraft(null);
  };

  return (
    <Toolbar
      className="rich-text-toolbar"
      role="toolbar"
      aria-label="Text formatting"
      onMouseDown={keepFocusWithinField}
      data-held-open={isPickingFile || undefined}
      data-link-form={isAddingLink || undefined}
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
              <Divider />
            </>
          )}
          {/* Headings are already bold */}
          <BoldButton
            editor={editor}
            isActive={active.bold}
            disabled={active.heading}
          />
          <ItalicButton editor={editor} isActive={active.italic} />
          <Divider />
          <BulletListButton editor={editor} isActive={active.bulletList} />
          <OrderedListButton editor={editor} isActive={active.orderedList} />
          <Divider />
          {/* Choosing a file swaps the button for a loading state, so hand focus to the editor first */}
          <span
            className="rich-text-image-upload"
            onClickCapture={openFilePicker}
            onKeyDownCapture={(ev) => {
              if (ev.key === "Enter" || ev.key === " ") openFilePicker();
            }}
          >
            <PublicFileUploadButton
              variant="tooltip"
              aria-label="Insert image"
              tooltipTitle="Insert image"
              onChange={(src) =>
                editor
                  .chain()
                  .focus()
                  // Insert after any selected text, rather than replacing it
                  .setTextSelection(editor.state.selection.to)
                  .setImage({ src })
                  .run()
              }
            />
          </span>
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

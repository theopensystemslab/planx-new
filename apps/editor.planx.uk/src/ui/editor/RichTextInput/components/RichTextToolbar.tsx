import Check from "@mui/icons-material/Check";
import Close from "@mui/icons-material/Close";
import Delete from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import Box from "@mui/material/Box";
import { type Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import { type FC, useEffect, useRef, useState } from "react";

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
  // Re-render on selection changes so that "active" button states track the cursor position
  // (useEditor does not re-render on transactions by default in Tiptap v3)
  useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor?.isActive("bold"),
      italic: editor?.isActive("italic"),
      bulletList: editor?.isActive("bulletList"),
      orderedList: editor?.isActive("orderedList"),
      h1: editor?.isActive("heading", { level: 1 }),
      h2: editor?.isActive("heading", { level: 2 }),
      link: editor?.isActive("link"),
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
            disabled={!editor.isActive("link")}
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
              <H1Button editor={editor} label={<strong>H2</strong>} />
              <H2Button editor={editor} label={<strong>H3</strong>} />
              <ToolbarDivider />
            </>
          )}
          <BoldButton editor={editor} />
          <ItalicButton editor={editor} />
          <ToolbarDivider />
          <BulletListButton editor={editor} />
          <OrderedListButton editor={editor} />
          <ToolbarDivider />
          <PublicFileUploadButton
            variant="tooltip"
            aria-label="Insert image"
            tooltipTitle="Insert image"
            onChange={(src) => editor.chain().focus().setImage({ src }).run()}
          />
          <ToolbarButton
            label={editor.isActive("link") ? "Edit link" : "Add link"}
            isActive={editor.isActive("link")}
            onClick={openLinkForm}
          >
            <LinkIcon />
          </ToolbarButton>
        </>
      )}
    </Toolbar>
  );
};

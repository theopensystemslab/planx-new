import Check from "@mui/icons-material/Check";
import Close from "@mui/icons-material/Close";
import Delete from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { type Editor, EditorOptions } from "@tiptap/core";
import Mention from "@tiptap/extension-mention";
import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor } from "@tiptap/react";
import React, {
  ChangeEvent,
  type FC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import Input from "../../shared/Input/Input";
import PublicFileUploadButton from "../../shared/PublicFileUploadButton";
import { H1Button, H2Button } from "./components/HeadingButtons";
import {
  BoldButton,
  BulletListButton,
  ItalicButton,
  OrderedListButton,
} from "./components/RichTextInputButtons";
import { suggestion } from "./components/suggestion";
import { RichContentContainer, StyledBubbleMenu } from "./styles";
import { commonExtensions, passportClassName } from "./tiptapExtensions";
import { Props } from "./types";
import { fromHtml, initialUrlValue, toHtml, trimUrlValue } from "./utils";

const LINE_HEIGHT_REM = 1.5;

const RichTextInput: FC<Props> = (props) => {
  const stringValue = String(props.value || "");
  const variant = props.variant ?? "default";
  const isRootLevel = variant === "rootLevelContent";
  const isParagraph = variant === "paragraphContent";

  // a11y: Element is treated as a HTMLInputElement but Tiptap renders a HTMLDivElement
  // Pass in input props to ensure they're passed along to the rich text editor
  const attributes = {
    // User provided props
    name: props.name,
    id: props.id,
    ...props.inputProps,
    // Default props overwritted by assigning our own
    contenteditable: "false",
    role: "textbox",
    translate: "no",
    ...(props.multiline &&
      props.rows && {
        style: `
        min-height: ${(props.rows as number) * LINE_HEIGHT_REM}rem; 
        display: flex;
        justify-content: flex-start;
      `,
      }),
  } as unknown as EditorOptions["editorProps"]["attributes"];

  const editor = useEditor({
    editorProps: { attributes },
    extensions: [
      ...commonExtensions,
      Mention.configure({
        HTMLAttributes: {
          // Mark mention tags with the 'pass' CSS class (short for passport)
          class: passportClassName,
        },
        suggestion,
      }),
      Placeholder.configure({
        placeholder: props.placeholder || "",
      }),
    ],
    content: fromHtml(stringValue),
    editable: !props.disabled,
  });

  const [addingLink, setAddingLink] = useState<{
    draft: string;
    selectionHtml: string | null;
  } | null>(null);

  // Cache internal string value
  const internalValue = useRef<string | null>(null);

  // Handle update events
  const handleUpdate = useCallback(
    (transaction: { editor: Editor }) => {
      if (!props.onChange) {
        return;
      }
      const doc = transaction.editor.getJSON();
      const html = toHtml(doc);
      internalValue.current = html;
      // Cast as an HTML input change event to conform to input field API's
      const changeEvent = {
        target: {
          name: props.name,
          value: html,
        },
        currentTarget: {
          name: props.name,
          value: html,
        },
      } as unknown as ChangeEvent<HTMLInputElement>;
      props.onChange(changeEvent);
    },
    [props.onChange, variant],
  );

  const handleSelectionUpdate = useCallback(() => {
    setAddingLink(null);
  }, [setAddingLink]);

  useEffect(() => {
    if (!editor) {
      return;
    }
    editor.on("update", handleUpdate);
    editor.on("selectionUpdate", handleSelectionUpdate);
    return () => {
      editor.off("update", handleUpdate);
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, handleUpdate]);

  // Update editor content if change is initiated from the parent props (not in sync with internal state)
  useEffect(() => {
    if (!editor) {
      return;
    }
    const editorValue = internalValue.current || toHtml(editor.getJSON());
    if (props.value === editorValue) {
      return;
    }
    internalValue.current = stringValue;
    const doc = fromHtml(stringValue);
    editor.commands.setContent(doc);
  }, [stringValue, variant]);

  // Returns the HTML snippet under the current selection, typically wrapped in a <p> tag, e.g. '<p>selected text</p>'
  const getSelectionHtml = () => {
    if (!editor) {
      return null;
    }
    try {
      const selectionDocument = {
        type: "doc",
        content: [editor.state.selection.content().toJSON().content[0]],
      };
      return toHtml(selectionDocument);
    } catch (err) {
      return null;
    }
  };

  const urlInputRef = useRef<{ focus: () => void; select: () => void }>(null);

  const isAddingLink = Boolean(addingLink);

  // Focus/select the URL input field value when it appears in the UI
  useEffect(() => {
    if (!isAddingLink) {
      return;
    }
    urlInputRef.current?.focus();
    const href = editor?.getAttributes("link")?.href || initialUrlValue;
    if (href !== initialUrlValue) {
      urlInputRef.current?.select();
    }
  }, [isAddingLink]);

  return (
    <ErrorWrapper id={props.name} error={props.errorMessage}>
      <RichContentContainer
        className={`rich-text-editor ${isRootLevel ? "allow-h1" : ""}`}
      >
        {editor && (
          <StyledBubbleMenu editor={editor}>
            <Box
              sx={{
                display: isAddingLink ? "flex" : "none",
                alignItems: "center",
              }}
            >
              <Input
                sx={{ width: 300 }}
                ref={urlInputRef}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter") {
                    editor
                      .chain()
                      .focus()
                      .toggleLink({
                        href: addingLink?.draft || "",
                      })
                      .run();
                    setAddingLink(null);
                  }
                }}
                value={addingLink?.draft || ""}
                onChange={(ev) => {
                  setAddingLink(
                    (prev) =>
                      prev && {
                        ...prev,
                        draft: trimUrlValue(ev.target.value),
                      },
                  );
                }}
              />
              <IconButton
                size="small"
                onClick={() => {
                  editor
                    .chain()
                    .focus()
                    .toggleLink({
                      href: addingLink?.draft || "",
                    })
                    .run();
                  setAddingLink(null);
                }}
              >
                <Check />
              </IconButton>
              <IconButton
                size="small"
                disabled={!editor.isActive("link")}
                onClick={() => {
                  editor.chain().focus().unsetLink().run();
                  setAddingLink(null);
                }}
              >
                <Delete />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => {
                  setAddingLink(null);
                }}
              >
                <Close />
              </IconButton>
            </Box>
            <Box
              sx={{
                display: isAddingLink ? "none" : "flex",
                alignItems: "center",
              }}
            >
              {!isParagraph && (
                <>
                  <H1Button
                    editor={editor}
                    label={<strong>{isRootLevel ? "H1" : "H2"}</strong>}
                  />
                  <H2Button
                    editor={editor}
                    label={<strong>{isRootLevel ? "H2" : "H3"}</strong>}
                  />
                </>
              )}
              <BoldButton editor={editor} />
              <ItalicButton editor={editor} />
              <BulletListButton editor={editor} />
              <OrderedListButton editor={editor} />
              <PublicFileUploadButton
                variant="tooltip"
                onChange={(src) =>
                  editor?.chain().focus().setImage({ src }).run()
                }
              />
              <IconButton
                size="small"
                color={editor.isActive("link") ? "primary" : undefined}
                onClick={() => {
                  if (editor.isActive("link")) {
                    const href =
                      editor.getAttributes("link")?.href || initialUrlValue;
                    setAddingLink({
                      selectionHtml: getSelectionHtml(),
                      draft: href,
                    });
                  } else {
                    setAddingLink({
                      selectionHtml: getSelectionHtml(),
                      draft: initialUrlValue,
                    });
                  }
                }}
              >
                <LinkIcon />
              </IconButton>
            </Box>
          </StyledBubbleMenu>
        )}
        <EditorContent editor={editor} />
      </RichContentContainer>
    </ErrorWrapper>
  );
};

export default RichTextInput;

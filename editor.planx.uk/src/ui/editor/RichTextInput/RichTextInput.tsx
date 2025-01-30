import Check from "@mui/icons-material/Check";
import Close from "@mui/icons-material/Close";
import Delete from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { type Editor } from "@tiptap/core";
import History from "@tiptap/extension-history";
import Mention from "@tiptap/extension-mention";
import ExtensionPlaceholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import React, {
  ChangeEvent,
  type FC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Input from "../../shared/Input/Input";
import PublicFileUploadButton from "../../shared/PublicFileUploadButton";
import { H1Button, H2Button } from "./components/HeadingButtons";
import { PopupError } from "./components/PopUpError";
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
import {
  fromHtml,
  getContentHierarchyError,
  getLinkNewTabError,
  initialUrlValue,
  linkSelectionError,
  toHtml,
  trimUrlValue,
} from "./utils";

const RichTextInput: FC<Props> = (props) => {
  const stringValue = String(props.value || "");

  const editor = useEditor({
    extensions: [
      ...commonExtensions,
      History,
      Mention.configure({
        HTMLAttributes: {
          // Mark mention tags with the 'pass' CSS class (short for passport)
          class: passportClassName,
        },
        suggestion,
      }),
      ExtensionPlaceholder.configure({
        placeholder: props.placeholder || "",
      }),
    ],
    content: fromHtml(stringValue),
    editable: Boolean(props.onChange),
  });

  const [addingLink, setAddingLink] = useState<{
    draft: string;
    selectionHtml: string | null;
  } | null>(null);

  // Cache internal string value
  const internalValue = useRef<string | null>(null);

  const [contentHierarchyError, setContentHierarchyError] = useState<
    string | null
  >(getContentHierarchyError(fromHtml(stringValue)));

  const [linkNewTabError, setLinkNewTabError] = useState<string | undefined>(
    getLinkNewTabError(fromHtml(stringValue).content),
  );

  // Handle update events
  const handleUpdate = useCallback(
    (transaction: { editor: Editor }) => {
      if (!props.onChange) {
        return;
      }
      const doc = transaction.editor.getJSON();

      setContentHierarchyError(getContentHierarchyError(doc));
      setLinkNewTabError(getLinkNewTabError(doc.content));

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
    [props.onChange],
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
    setContentHierarchyError(getContentHierarchyError(doc));
    editor.commands.setContent(doc);
  }, [stringValue]);

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
    <RichContentContainer>
      {editor && (
        <StyledBubbleMenu
          editor={editor}
          tippyOptions={{
            duration: 100,
            // Hack to "stop" transition of BubbleMenu
            moveTransition: "transform 600s",
          }}
          className="bubble-menu"
        >
          {addingLink ? (
            <Input
              ref={urlInputRef}
              onKeyDown={(ev) => {
                if (ev.key === "Enter") {
                  editor
                    .chain()
                    .focus()
                    .toggleLink({
                      href: addingLink.draft,
                    })
                    .run();
                  setAddingLink(null);
                }
              }}
              value={addingLink.draft}
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
          ) : (
            <>
              <H1Button editor={editor} />
              <H2Button editor={editor} />
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
            </>
          )}
          {addingLink ? (
            <>
              {(() => {
                const error =
                  addingLink.selectionHtml &&
                  linkSelectionError(addingLink.selectionHtml);
                return error ? (
                  <PopupError id="link-popup" error={error} />
                ) : (
                  <IconButton
                    size="small"
                    onClick={() => {
                      editor
                        .chain()
                        .focus()
                        .toggleLink({
                          href: addingLink.draft,
                        })
                        .run();
                      setAddingLink(null);
                    }}
                  >
                    <Check />
                  </IconButton>
                );
              })()}
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
            </>
          ) : (
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
          )}
        </StyledBubbleMenu>
      )}
      <EditorContent editor={editor} />
      {contentHierarchyError && (
        <Box sx={{ position: "absolute", top: 0, right: 0 }}>
          <PopupError
            id="content-error-hierarchy"
            error={contentHierarchyError}
          />
        </Box>
      )}
      {linkNewTabError && (
        <Box sx={{ position: "absolute", top: 0, right: 0 }}>
          <PopupError id="content-error-link-tab" error={linkNewTabError} />
        </Box>
      )}
    </RichContentContainer>
  );
};

export default RichTextInput;

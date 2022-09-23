import "./RichTextEditor2.css";

import IconButton from "@material-ui/core/IconButton";
import { InputBaseProps } from "@material-ui/core/InputBase";
import Check from "@material-ui/icons/Check";
import Close from "@material-ui/icons/Close";
import FormatBold from "@material-ui/icons/FormatBold";
import FormatItalic from "@material-ui/icons/FormatItalic";
import LinkIcon from "@material-ui/icons/Link";
import Title from "@material-ui/icons/Title";
import Bold from "@tiptap/extension-bold";
import BulletList from "@tiptap/extension-bullet-list";
import Document from "@tiptap/extension-document";
import HardBreak from "@tiptap/extension-hard-break";
import Heading from "@tiptap/extension-heading";
import History from "@tiptap/extension-history";
import Italic from "@tiptap/extension-italic";
import Link from "@tiptap/extension-link";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import Paragraph from "@tiptap/extension-paragraph";
import ExtensionPlaceholder from "@tiptap/extension-placeholder";
import Text from "@tiptap/extension-text";
import { generateHTML, generateJSON } from "@tiptap/html";
import { BubbleMenu, EditorContent, useEditor } from "@tiptap/react";
import React, {
  type FC,
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Input from "./Input";

interface Props extends InputBaseProps {
  className?: string;
  onChange?: (ev: ChangeEvent<HTMLInputElement>) => void;
  bordered?: boolean;
  errorMessage?: string;
}

const commonExtensions = [
  Document,
  Paragraph,
  Text,
  Bold,
  Italic,
  Link,
  Heading.configure({
    levels: [1, 2],
  }),
  BulletList,
  OrderedList,
  ListItem,
];

const RichTextInput2: FC<Props> = (props) => {
  const stringValue = String(props.value || "");
  const editor = useEditor({
    extensions: [
      ...commonExtensions,
      History,
      HardBreak,
      ExtensionPlaceholder.configure({
        placeholder: props.placeholder || "",
      }),
    ],
    content: generateJSON(stringValue, commonExtensions),
    editable: Boolean(props.onChange),
  });

  const [addingLink, setAddingLink] = useState<{ draft: string } | null>(null);

  // Cache internal string value
  const internalValue = useRef<string | null>(null);

  const handleUpdate = useCallback(
    (transaction) => {
      if (!props.onChange) {
        return;
      }
      const doc = transaction.editor.getJSON();
      const html = generateHTML(doc, commonExtensions);
      internalValue.current = html;
      const changeEvent = {
        target: {
          name: props.name,
          value: html,
        },
      } as unknown as ChangeEvent<HTMLInputElement>;
      props.onChange(changeEvent);
    },
    [props.onChange]
  );

  // Update editor content if change is initiated from the parent props (not in sync with internal state)
  useEffect(() => {
    if (!editor) {
      return;
    }
    const editorValue =
      internalValue.current || generateHTML(editor.getJSON(), commonExtensions);
    if (props.value !== editorValue) {
      internalValue.current = stringValue;
      editor.commands.setContent(generateJSON(stringValue, commonExtensions));
    }
  }, [stringValue]);

  useEffect(() => {
    if (!editor) {
      return;
    }
    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor, handleUpdate]);

  return (
    <>
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="bubble-menu"
        >
          {addingLink ? (
            <Input
              innerRef={(el) => {
                el?.querySelector("input")?.focus();
              }}
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
                setAddingLink({
                  draft: ev.target.value,
                });
              }}
            />
          ) : (
            <>
              <IconButton
                size="small"
                color={editor.isActive("bold") ? "primary" : undefined}
                onClick={() => {
                  editor.chain().focus().toggleHeading({ level: 1 }).run();
                }}
              >
                <Title />
              </IconButton>
              <IconButton
                size="small"
                color={editor.isActive("bold") ? "primary" : undefined}
                onClick={() => {
                  editor.chain().focus().toggleBold().run();
                }}
              >
                <FormatBold />
              </IconButton>
              <IconButton
                size="small"
                color={editor.isActive("italic") ? "primary" : undefined}
                onClick={() => {
                  editor.chain().focus().toggleItalic().run();
                }}
              >
                <FormatItalic />
              </IconButton>
            </>
          )}
          <IconButton
            size="small"
            color={editor.isActive("link") ? "primary" : undefined}
            onClick={() => {
              const selectionText = editor.state.selection.content().toJSON();
              console.log(selectionText);
              if (!addingLink) {
                if (editor.isActive("link")) {
                  editor.chain().focus().unsetLink().run();
                } else {
                  setAddingLink({
                    draft: "https://",
                  });
                }
              } else {
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
          >
            {addingLink ? <Check /> : <LinkIcon />}
          </IconButton>
          {addingLink && (
            <IconButton
              size="small"
              onClick={() => {
                setAddingLink(null);
              }}
            >
              <Close />
            </IconButton>
          )}
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
    </>
  );
};

export default RichTextInput2;

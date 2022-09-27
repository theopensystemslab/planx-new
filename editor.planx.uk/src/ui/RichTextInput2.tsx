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
import Mention from "@tiptap/extension-mention";
import OrderedList from "@tiptap/extension-ordered-list";
import Paragraph from "@tiptap/extension-paragraph";
import ExtensionPlaceholder from "@tiptap/extension-placeholder";
import Text from "@tiptap/extension-text";
import { generateHTML, generateJSON } from "@tiptap/html";
import {
  BubbleMenu,
  EditorContent,
  ReactRenderer,
  useEditor,
} from "@tiptap/react";
import React, {
  type FC,
  ChangeEvent,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import tippy from "tippy.js";

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

const conversionExtensions = [
  ...commonExtensions,

  Mention.configure({
    HTMLAttributes: {
      class: "pass",
    },
  }),
];

const RichTextInput2: FC<Props> = (props) => {
  const stringValue = String(props.value || "");
  const editor = useEditor({
    extensions: [
      ...commonExtensions,
      History,
      Mention.configure({
        HTMLAttributes: {
          class: "pass",
        },
        suggestion,
      }),
      HardBreak,
      ExtensionPlaceholder.configure({
        placeholder: props.placeholder || "",
      }),
    ],
    content: generateJSON(stringValue, commonExtensions),
    editable: Boolean(props.onChange),
  });

  const [addingLink, setAddingLink] = useState<{
    draft: string;
    selectionHtml: string | null;
  } | null>(null);

  // Cache internal string value
  const internalValue = useRef<string | null>(null);

  const handleUpdate = useCallback(
    (transaction: any) => {
      if (!props.onChange) {
        return;
      }
      const doc = transaction.editor.getJSON();
      const html = generateHTML(doc, conversionExtensions);
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
      internalValue.current ||
      generateHTML(editor.getJSON(), conversionExtensions);
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

  const getSelectionHtml = () => {
    if (!editor) {
      return null;
    }
    try {
      const selectionDocument = {
        type: "doc",
        content: [editor.state.selection.content().toJSON().content[0]],
      };
      return generateHTML(selectionDocument, conversionExtensions);
    } catch (err) {
      return null;
    }
  };

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
              errorMessage={
                addingLink.selectionHtml === "<p>click here</p>"
                  ? "Please set link over descriptive piece of content."
                  : undefined
              }
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
                setAddingLink(
                  (prev) =>
                    prev && {
                      ...prev,
                      draft: ev.target.value,
                    }
                );
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
              if (!addingLink) {
                if (editor.isActive("link")) {
                  editor.chain().focus().unsetLink().run();
                } else {
                  setAddingLink({
                    selectionHtml: getSelectionHtml(),
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

// Implemented based on the mention plugin example code snippets: https://tiptap.dev/api/nodes/mention
const suggestion = {
  items: ({ query }: { query: string }) => {
    return [
      "Lea Thompson",
      "Cyndi Lauper",
      "Tom Cruise",
      "Madonna",
      "Jerry Hall",
      "Joan Collins",
      "Winona Ryder",
      "Christina Applegate",
      "Alyssa Milano",
      "Molly Ringwald",
      "Ally Sheedy",
      "Debbie Harry",
      "Olivia Newton-John",
      "Elton John",
      "Michael J. Fox",
      "Axl Rose",
      "Emilio Estevez",
      "Ralph Macchio",
      "Rob Lowe",
      "Jennifer Grey",
      "Mickey Rourke",
      "John Cusack",
      "Matthew Broderick",
      "Justine Bateman",
      "Lisa Bonet",
    ]
      .filter((item) => item.toLowerCase().startsWith(query.toLowerCase()))
      .slice(0, 5);
  },

  render: () => {
    let component: any;
    let popup: any;

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        popup = tippy("body", {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
      },

      onUpdate(props: any) {
        component.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props: any) {
        if (props.event.key === "Escape") {
          popup[0].hide();
          return true;
        }

        return component.ref?.onKeyDown(props);
      },

      onExit() {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
};

export interface Placeholder {
  id: string;
  label: string;
}

interface MentionListProps {
  items: Placeholder[];
  command: any;
  onCreatePlaceholder: (val: string) => void;
}

// Implemented based on the mention plugin example code snippets: https://tiptap.dev/api/nodes/mention
const MentionList = forwardRef((props: MentionListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];

    if (item) {
      props.command({ id: item });
    }
  };

  const upHandler = () => {
    setSelectedIndex(
      (selectedIndex + props.items.length - 1) % props.items.length
    );
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }

      if (event.key === "ArrowDown") {
        downHandler();
        return true;
      }

      if (event.key === "Enter") {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="mention-items">
      {props.items.length ? (
        props.items.map((item: any, index: number) => (
          <button
            className={`mention-item ${
              index === selectedIndex ? "mention-item-selected" : ""
            }`}
            key={index}
            onClick={() => selectItem(index)}
          >
            {item}
          </button>
        ))
      ) : (
        <div className="mention-item-empty">No result</div>
      )}
    </div>
  );
});

export default RichTextInput2;

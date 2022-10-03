import "./RichTextInput2.css";

import IconButton from "@material-ui/core/IconButton";
import { InputBaseProps } from "@material-ui/core/InputBase";
import Check from "@material-ui/icons/Check";
import Close from "@material-ui/icons/Close";
import Error from "@material-ui/icons/Error";
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
import { map } from "ramda";
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
import create from "zustand";

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
    levels: [1, 2, 3],
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

interface VariablesState {
  variables: string[];
  addVariable: (newVariable: string) => void;
}

const selectionHtmlError = (selectionHtml: string) =>
  selectionHtml === "<p>click here</p>"
    ? "Please set link over descriptive piece of content."
    : undefined;

const useVariablesStore = create<VariablesState>((set) => ({
  variables: [],
  addVariable: (newVariable: string) =>
    set((state) => ({ variables: [...state.variables, newVariable] })),
}));

export const toHtml = (doc: any) => {
  return generateHTML(doc, conversionExtensions);
};

export const fromHtml = (htmlString: string) => {
  return generateJSON(htmlString, conversionExtensions);
};

export const injectVariables = (
  htmlString: string,
  vars: Record<string, string>
) => {
  const doc = fromHtml(htmlString);
  return toHtml(
    modifyDeep((node) => {
      return node.type === "mention"
        ? {
            ...node,
            type: "text",
            text: vars[node.attrs.id] || "Unknown",
            attrs: undefined,
          }
        : null;
    })(doc)
  );
};

/**
 * Traverse a nested object/array and apply a modification at each level. If the modifier returns `null`, leave the result unchanged.
 */
const modifyDeep =
  (fn: (field: any) => any) =>
  (val: any): any => {
    if (!val) {
      return val;
    }
    const mod = fn(val);
    if (mod) {
      return mod;
    }
    if (Array.isArray(val)) {
      return map(modifyDeep(fn), val);
    }
    if (typeof val === "object") {
      return map(modifyDeep(fn), val);
    }
    return val;
  };

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
    content: fromHtml(stringValue),
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
      const html = toHtml(doc);
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
    const editorValue = internalValue.current || toHtml(editor.getJSON());
    if (props.value !== editorValue) {
      internalValue.current = stringValue;
      editor.commands.setContent(fromHtml(stringValue));
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
      return toHtml(selectionDocument);
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
          {addingLink ? (
            <>
              {(() => {
                const error =
                  addingLink.selectionHtml &&
                  selectionHtmlError(addingLink.selectionHtml);
                return error ? (
                  <IconButton size="small">
                    <Error />
                  </IconButton>
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
                  editor.chain().focus().unsetLink().run();
                } else {
                  setAddingLink({
                    selectionHtml: getSelectionHtml(),
                    draft: "https://",
                  });
                }
              }}
            >
              <LinkIcon />
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
    return useVariablesStore
      .getState()
      .variables.filter((item) =>
        item.toLowerCase().includes(query.toLowerCase())
      )
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
  query: string;
  command: any;
  onCreatePlaceholder: (val: string) => void;
}

// Implemented based on the mention plugin example code snippets: https://tiptap.dev/api/nodes/mention
const MentionList = forwardRef((props: MentionListProps, ref) => {
  const variablesStore = useVariablesStore();
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
      {props.query.length > 0 && (
        <button
          className="mention-add-button"
          onClick={() => {
            props.command({ id: props.query });
            variablesStore.addVariable(props.query);
          }}
        >
          + Add <span className="pass">@{props.query}</span>
        </button>
      )}
      {props.items.length > 0 ? (
        props.items.map((item: any, index: number) => (
          <button
            className={`mention-item ${
              index === selectedIndex ? "mention-item-selected" : ""
            }`}
            key={index}
            onClick={() => selectItem(index)}
          >
            <span className="pass">@{item}</span>
          </button>
        ))
      ) : (
        <p className="mention-items-empty">No results</p>
      )}
    </div>
  );
});

export default RichTextInput2;

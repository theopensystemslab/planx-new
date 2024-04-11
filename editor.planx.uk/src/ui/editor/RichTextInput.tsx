import Check from "@mui/icons-material/Check";
import Close from "@mui/icons-material/Close";
import Delete from "@mui/icons-material/Delete";
import Error from "@mui/icons-material/Error";
import FormatBold from "@mui/icons-material/FormatBold";
import FormatItalic from "@mui/icons-material/FormatItalic";
import FormatListBulleted from "@mui/icons-material/FormatListBulleted";
import FormatListNumbered from "@mui/icons-material/FormatListNumbered";
import LinkIcon from "@mui/icons-material/Link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { type InputBaseProps } from "@mui/material/InputBase";
import Popover from "@mui/material/Popover";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { type Editor, type JSONContent } from "@tiptap/core";
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
  ChangeEvent,
  type FC,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { inputFocusStyle } from "theme";
import tippy, { type Instance } from "tippy.js";
import { create } from "zustand";

import Input from "../shared/Input";
import PublicFileUploadButton from "../shared/PublicFileUploadButton";
import CustomImage from "./RichTextImage";

interface Props extends InputBaseProps {
  className?: string;
  onChange?: (ev: ChangeEvent<HTMLInputElement>) => void;
  bordered?: boolean;
  errorMessage?: string;
}

export const RichContentContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  "& .ProseMirror": {
    padding: "12px 15px",
    backgroundColor: theme.palette.common.white,
    minHeight: "50px",
    border: `1px solid ${theme.palette.border.light}`,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    wordBreak: "break-word",
    "& a": {
      color: "currentColor",
    },
    "& > *": {
      margin: 0,
    },
    "& > * + *": {
      marginTop: theme.spacing(1),
    },
    "& ol, & ul": {
      marginBottom: theme.spacing(1),
    },
    "& ol li, & ul li": {
      margin: theme.spacing(0.5, 0, 0),
    },
    "& ol p, & ul p": {
      margin: 0,
    },
    "& h1, & h2, & h3": {
      "& strong": {
        fontWeight: "inherit",
      },
    },
    // Styles for placeholder text, to match ui/Input.tsx
    "& p.is-editor-empty:nth-child(1)::before": {
      color: theme.palette.text.placeholder,
      opacity: 1,
      content: `attr(data-placeholder)`,
      float: "left",
      height: 0,
      pointerEvents: "none",
    },
    // Focus styles
    "&.ProseMirror-focused": {
      ...inputFocusStyle,
    },
    // Styles for injected passport/mention
    "& .passport": {
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.text.primary,
      padding: theme.spacing(0.25, 0.5),
      borderRadius: "4px",
    },
  },
}));

const StyledBubbleMenu = styled(BubbleMenu)(({ theme }) => ({
  background: theme.palette.background.default,
  boxShadow: "0 2px 6px 0 rgba(0, 0, 0, 0.2)",
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0.25),
}));

const MentionItems = styled(Box)(({ theme }) => ({
  background: theme.palette.common.white,
  fontSize: "0.875em",
  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
  borderRadius: "4px",
  width: "150px",
  overflow: "hidden",
  padding: theme.spacing(0.25),
}));

const MentionItemsButton = styled(Button)(({ theme }) => ({
  border: 0,
  background: "none",
  boxShadow: "none",
  padding: theme.spacing(0.25),
  display: "block",
  width: "100%",
  textAlign: "left",
  "&.mention-item-selected": {
    background: `rgba(0, 0, 0, 0.03)`,
  },
}));

const MentionItemsEmpty = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(0.25),
  margin: 0,
  color: theme.palette.text.secondary,
}));

const passportClassName = "passport";

// Shared tiptap editor extensions
const commonExtensions = [
  Document,
  Paragraph,
  Text,
  Bold,
  Italic,
  HardBreak,
  Link.configure({
    openOnClick: false,
    autolink: false,
  }),
  Heading.configure({
    levels: [1, 2, 3],
  }),
  BulletList,
  OrderedList,
  ListItem,
  CustomImage,
];

// Tiptap editor extensions used to convert between HTML and Prosemirror document state (used internally by tiptap)
const conversionExtensions = [
  ...commonExtensions,
  Mention.configure({
    HTMLAttributes: {
      class: passportClassName,
    },
  }),
];

interface VariablesState {
  variables: string[];
  addVariable: (newVariable: string) => void;
}

export const emptyContent = "<p></p>";

// Specify whether a selection is unsuitable for ensuring accessible links
const linkSelectionError = (selectionHtml: string): string | null => {
  if (selectionHtml.startsWith("<p>") && selectionHtml.endsWith("</p>")) {
    const text = selectionHtml.slice(3, -4);
    const lowercaseText = text.toLowerCase();
    if (lowercaseText.includes("click") || lowercaseText.includes("here")) {
      return "Links must be set over text that accurately describes what the link is for. Avoid generic language such as 'click here'.";
    }
    if (text[0] && text[0] !== text[0].toUpperCase() && text.length < 8) {
      return "Make sure the link text accurately describes the what the link is for.";
    }
  }
  return null;
};

// Maintain a store of variables as they are created in the '@'-mention plugin, making them available in memory for next time.
// TODO: explore instantiating from a hard-coded list, or persisting in either the backend or local storage.
const useVariablesStore = create<VariablesState>()((set) => ({
  variables: [],
  addVariable: (newVariable: string) =>
    set((state) => ({ variables: [...state.variables, newVariable] })),
}));

export const toHtml = (doc: JSONContent) => {
  const outgoingHtml = generateHTML(doc, conversionExtensions);
  return outgoingHtml === emptyContent ? "" : outgoingHtml;
};

export const fromHtml = (htmlString: string) => {
  return generateJSON(
    htmlString === "" ? emptyContent : htmlString,
    conversionExtensions,
  );
};

export const injectVariables = (
  htmlString: string,
  vars: Record<string, string>,
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
    })(doc),
  );
};

/**
 * Traverse a nested object/array and apply a modification at each level. If the modifier returns `null`, it leaves the result unchanged.
 * Used to inject placeholder values into a document structure.
 */
export const modifyDeep =
  (fn: (field: Value) => Value) =>
  (val: Value): Value => {
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

// Generic value that `modifyDeep` works off of. Since it can be object, array or primitive, any typing more accurate than `any` is not compiling at the moment.
// TODO: find a better typing alternative
type Value = any;

const initialUrlValue = "https://";

// Makes sure that if the user pastes a full URL into the input, the pre-populated `https://` is removed
// e.g. https://https://something.com -> https://something.com
const trimUrlValue = (url: string) => {
  if (url.startsWith(`${initialUrlValue}${initialUrlValue}`)) {
    return url.slice(initialUrlValue.length);
  }
  return url;
};

const getContentHierarchyError = (doc: JSONContent): string | null => {
  let h1Index = -1;
  let h2Index = -1;

  let error: string | null = null;

  (doc.content || []).forEach((d: JSONContent, index) => {
    if (d.type === "paragraph") {
      return;
    } else if (d.type === "heading") {
      const level = d.attrs?.level === 1 ? 1 : 2;
      if (level === 1) {
        if (h1Index === -1 && h2Index !== -1) {
          error = "A level 1 heading must come before a level 2 heading.";
        } else if (h1Index !== -1) {
          error =
            "There cannot be more than one level 1 heading in the document.";
        } else if (index !== 0) {
          error = "The level 1 heading must come first in the document.";
        }
        h1Index = index;
        return;
      }
      if (level === 2) {
        if (h1Index === -1) {
          error = "A level 1 heading must come before a level 2 heading.";
        }
        h2Index = index;
        return;
      }
    }
    return null;
  });

  return error;
};

const getLinkNewTabError = (
  content: JSONContent | undefined = [],
): string | undefined => {
  let error: string | undefined;
  if (!content) return;

  content.forEach((child: JSONContent) => {
    if (!child.content) return;

    child.content.forEach(({ marks, text }) => {
      const isLink = marks?.map(({ type }) => type).includes("link");
      const hasOpenTabText = text?.includes("(opens in a new tab)");

      if (hasOpenTabText && !isLink) {
        error = 'Links must wrap the text "(opens in a new tab)"';
      }
    });
  });

  return error;
};

const PopupError: FC<{ id: string; error: string }> = (props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Box>
      <IconButton size="small" onClick={handleOpen}>
        <Error />
      </IconButton>
      <Popover
        id="popover"
        sx={{
          zIndex: 100000,
          maxWidth: "xs",
          padding: 10,
        }}
        open={open}
        onClose={handleClose}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Typography variant="body2" sx={{ padding: 1 }}>
          {props.error}
        </Typography>
      </Popover>
    </Box>
  );
};

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
    if (props.value !== editorValue) {
      internalValue.current = stringValue;
      const doc = fromHtml(stringValue);
      setContentHierarchyError(getContentHierarchyError(doc));
      editor.commands.setContent(doc);
    }
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
    if (isAddingLink) {
      urlInputRef.current?.focus();
      const href = editor?.getAttributes("link")?.href || initialUrlValue;
      if (href !== initialUrlValue) {
        urlInputRef.current?.select();
      }
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
              <IconButton
                size="small"
                color={
                  editor.isActive("heading", { level: 1 })
                    ? "primary"
                    : undefined
                }
                onClick={() => {
                  editor.chain().focus().toggleHeading({ level: 1 }).run();
                }}
              >
                <strong>H1</strong>
              </IconButton>
              <IconButton
                size="small"
                color={
                  editor.isActive("heading", { level: 2 })
                    ? "primary"
                    : undefined
                }
                onClick={() => {
                  editor.chain().focus().toggleHeading({ level: 2 }).run();
                }}
              >
                <strong>H2</strong>
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
              <IconButton
                size="small"
                color={editor.isActive("bulletList") ? "primary" : undefined}
                onClick={() => {
                  editor.chain().focus().toggleBulletList().run();
                }}
              >
                <FormatListBulleted />
              </IconButton>
              <IconButton
                size="small"
                color={editor.isActive("orderedList") ? "primary" : undefined}
                onClick={() => {
                  editor.chain().focus().toggleOrderedList().run();
                }}
              >
                <FormatListNumbered />
              </IconButton>
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

// Implemented based on the mention plugin example code snippets: https://tiptap.dev/api/nodes/mention
const suggestion = {
  items: ({ query }: { query: string }) => {
    return useVariablesStore
      .getState()
      .variables.filter((item) =>
        item.toLowerCase().includes(query.toLowerCase()),
      )
      .slice(0, 5);
  },

  render: () => {
    let component: undefined | ReactRenderer<any, any>;
    let popup: Instance[] | undefined;

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
        component?.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        popup?.[0]?.setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props: any) {
        if (props.event.key === "Escape") {
          popup?.[0]?.hide();
          return true;
        }

        return component?.ref?.onKeyDown(props);
      },

      onExit() {
        popup?.[0]?.destroy();
        component?.destroy();
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
      (selectedIndex + props.items.length - 1) % props.items.length,
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
    <MentionItems>
      {props.query.length > 0 && (
        <MentionItemsButton
          variant="text"
          onClick={() => {
            props.command({ id: props.query });
            variablesStore.addVariable(props.query);
          }}
        >
          + Add <span className={passportClassName}>@{props.query}</span>
        </MentionItemsButton>
      )}
      {props.items.length > 0 ? (
        props.items.map((item: any, index: number) => (
          <MentionItemsButton
            variant="text"
            className={`mention-item ${
              index === selectedIndex ? "mention-item-selected" : ""
            }`}
            key={index}
            onClick={() => selectItem(index)}
          >
            <span className={passportClassName}>@{item}</span>
          </MentionItemsButton>
        ))
      ) : (
        <MentionItemsEmpty variant="body2">No results</MentionItemsEmpty>
      )}
    </MentionItems>
  );
});

export default RichTextInput;

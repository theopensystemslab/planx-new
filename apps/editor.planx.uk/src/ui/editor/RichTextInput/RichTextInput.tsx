import Tooltip from "@mui/material/Tooltip";
import type { EditorOptions } from "@tiptap/core";
import { type Editor } from "@tiptap/core";
import Mention from "@tiptap/extension-mention";
import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor } from "@tiptap/react";
import type { ChangeEvent, MouseEvent } from "react";
import { type FC, useCallback, useEffect, useRef } from "react";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import { RichTextToolbar } from "./components/RichTextToolbar";
import { suggestion } from "./components/suggestion";
import { RichContentContainer, RichTextMarker } from "./styles";
import { commonExtensions, passportClassName } from "./tiptapExtensions";
import type { Props } from "./types";
import { fromHtml, toHtml } from "./utils";

const LINE_HEIGHT_REM = 1.5;

const INTERACTIVE_ELEMENTS = "a[href], button, input, select, textarea";

const RichTextInput: FC<Props> = (props) => {
  const stringValue = String(props.value || "");
  const variant = props.variant ?? "default";
  const isParagraph = variant === "paragraphContent";

  // a11y: Element is treated as a HTMLInputElement but Tiptap renders a HTMLDivElement
  // Pass in input props to ensure they're passed along to the rich text editor
  const attributes = {
    // User provided props
    name: props.name,
    // Only set id when explicitly provided (undefined would render as the string "undefined")
    ...(props.id !== undefined && { id: props.id }),
    // div[role="textbox"] is not a native labelable element, so <label for> cannot provide
    // an accessible name. Use aria-label from placeholder or name as fallback.
    ...((props.placeholder || props.name) && {
      "aria-label": props.placeholder || props.name,
    }),
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

  useEffect(() => {
    if (!editor) {
      return;
    }
    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
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

  const isEditable = Boolean(editor) && !props.disabled;

  // Fields are often wrapped in a <label> (e.g. ui/editor/InputLabel). Clicking non-interactive
  // content within a label forwards the click to its first labelable descendant - here, a toolbar
  // button - which would apply formatting. Cancel this activation for any click not on a control.
  const preventLabelActivation = (ev: MouseEvent<HTMLDivElement>) => {
    const target = ev.target as Element;
    if (!target.closest(INTERACTIVE_ELEMENTS)) ev.preventDefault();
  };

  return (
    <ErrorWrapper id={props.name} error={props.errorMessage}>
      <RichContentContainer
        className="rich-text-editor"
        onClick={preventLabelActivation}
      >
        {editor && isEditable && (
          <RichTextToolbar editor={editor} showHeadings={!isParagraph} />
        )}
        <div className="rte-field">
          <EditorContent editor={editor} className="rte-content" />
          {isEditable && (
            <Tooltip title="Rich text" placement="top">
              <RichTextMarker
                className="rte-marker"
                aria-hidden
                // Clicking the marker should behave like clicking into the field
                onMouseDown={(ev) => {
                  ev.preventDefault();
                  editor?.commands.focus("end");
                }}
              >
                <span className="rte-marker-bold">A</span>
                <span className="rte-marker-italic">a</span>
              </RichTextMarker>
            </Tooltip>
          )}
        </div>
      </RichContentContainer>
    </ErrorWrapper>
  );
};

export default RichTextInput;

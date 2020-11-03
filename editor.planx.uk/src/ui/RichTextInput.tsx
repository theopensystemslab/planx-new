import { Box, InputBaseProps, makeStyles } from "@material-ui/core";
import { convertToRaw, EditorState } from "draft-js";
import { stateToMarkdown } from "draft-js-export-markdown";
import { stateFromMarkdown } from "draft-js-import-markdown";
import MUIRichTextEditor from "mui-rte";
import React, {
  ChangeEvent,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from "react";

import { levenshteinDistance } from "../utils";

interface Props extends InputBaseProps {
  className?: string;
  onChange?: (ev: ChangeEvent<HTMLInputElement>) => void;
}

const rteContainerStyles = makeStyles((theme) => ({
  regular: {
    position: "relative",
    boxSizing: "border-box",
    // This is necessary for the focus styles to be visible. Breaks the layout a bit
    // unfortunately. TODO: find a better solution.
    padding: 2,
    outline: "none",
    width: "100%",
  },
  focused: {
    position: "relative",
    boxSizing: "border-box",
    // This is necessary for the focus styles to be visible. Breaks the layout a bit
    // unfortunately. TODO: find a better solution.
    padding: 2,
    outline: "none",
    boxShadow: `inset 0 0 0 2px ${theme.palette.primary.light}`,
    width: "100%",
  },
  editorFocus: {
    boxShadow: `inset 0 0 0 2px ${theme.palette.primary.light}`,
  },
}));

const mdToEditorRawContent = (str: unknown) =>
  convertToRaw(stateFromMarkdown(str));

const RichTextInput: React.FC<
  Props & { editorStateRef: MutableRefObject<EditorState | null> }
> = (props) => {
  // Set the initial `value` prop and ignore updated values to avoid infinite loops
  const [initialValue] = useState(mdToEditorRawContent(props.value || ""));

  const [focused, setFocused] = useState(false);

  const editorRef = useRef<any>(null);

  const containerRef = useRef(null);

  useEffect(() => {
    const globalClickHandler = (ev: any) => {
      if (!containerRef.current) {
        return;
      }
      const container = containerRef.current;
      if (
        container.contains(ev.target) &&
        container.contains(document.querySelector(".DraftEditor-root"))
      ) {
        editorRef.current.focus();
        setFocused(true);
      }
    };
    document.addEventListener("click", globalClickHandler);
    return () => {
      document.removeEventListener("click", globalClickHandler);
    };
  }, []);

  const classes = rteContainerStyles();

  return (
    <Box
      {
        /**
         * This hack is necessary because <Box/> component ref attribute is not typed.
         * See https://github.com/mui-org/material-ui/issues/17010
         */
        ...({ ref: containerRef } as any)
      }
      className={focused ? classes.focused : classes.regular}
    >
      <MUIRichTextEditor
        onFocus={() => {
          setFocused(true);
        }}
        onBlur={() => {
          setFocused(false);
        }}
        defaultValue={JSON.stringify(initialValue)}
        ref={editorRef}
        toolbarButtonSize="small"
        inlineToolbar={true}
        toolbar={false}
        inlineToolbarControls={[
          "bold",
          "italic",
          "underline",
          "link",
          "bulletList",
        ]}
        label={props.placeholder}
        onChange={(newState) => {
          props.editorStateRef.current = newState;

          if (!props.onChange) {
            return;
          }
          const md = stateToMarkdown(newState.getCurrentContent());

          if (md !== props.value) {
            // Construct and cast as a change event so the component stays compatible with formik helpers
            const changeEvent = ({
              target: {
                name: props.name,
                value: md,
              },
            } as unknown) as ChangeEvent<HTMLInputElement>;
            props.onChange(changeEvent);
          }
        }}
      />
    </Box>
  );
};

const normalizeMdForEquality = (md: string): string =>
  md
    .split("\n")
    .filter((line) => line !== "")
    .map((line) => line.trim())
    .join("\n");

/**
 * Crude, permissive checker for markdown equality.
 * It is meant to return true more often than not to prevent editor remounting.
 */
const mdEqual = (md1: string, md2: string): boolean => {
  const n1 = normalizeMdForEquality(md1);
  const n2 = normalizeMdForEquality(md2);

  // Check for regular equality first as it may be faster - default to Levenshtein distance
  return n1 === n2 || levenshteinDistance(n1, n2) <= 2;
};

/**
 * This component wraps the main rich text input component in order to check if the editor state
 * and the value are in sync (this may not be the case if the editor was inside a rearranged list,
 * or a new value was available through ShareDB), turning the editor into a proper controlled input.
 * mui-rte should be doing this automatically through https://github.com/niuware/mui-rte/issues/42
 * and the referenced https://github.com/niuware/mui-rte/blob/master/examples/reset-value/index.tsx,
 * but this leads to a jagged editing experience with ignored keystrokes and infinite loops.
 *
 * The way this component works is that if there is a mismatch, the RichTextEditor component is
 * unmounted and reinserted immediately afterwards to start with a clean slate.
 *
 * It is lame but it is works 🙃
 */
const ControlledRichTextInput: React.FC<Props> = (props) => {
  const editorStateRef = useRef<EditorState | null>(null);
  const [unmounted, setUnmounted] = useState(false);
  useEffect(() => {
    if (editorStateRef.current !== null && typeof props.value === "string") {
      const md = stateToMarkdown(editorStateRef.current.getCurrentContent());
      if (!mdEqual(md, props.value)) {
        setUnmounted(true);
      }
    }
  }, [props.value, editorStateRef]);

  useEffect(() => {
    if (unmounted) {
      setTimeout(() => {
        setUnmounted(false);
      });
    }
  }, [unmounted, setUnmounted]);
  return unmounted ? null : (
    <RichTextInput {...props} editorStateRef={editorStateRef} />
  );
};

export default ControlledRichTextInput;

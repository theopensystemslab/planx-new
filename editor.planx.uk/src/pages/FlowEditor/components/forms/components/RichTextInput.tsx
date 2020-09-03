import { Box, InputBaseProps, makeStyles } from "@material-ui/core";
import { convertToRaw } from "draft-js";
import { stateToMarkdown } from "draft-js-export-markdown";
import { stateFromMarkdown } from "draft-js-import-markdown";
import MUIRichTextEditor, {
  TAsyncAtomicBlockResponse,
  TMUIRichTextEditorRef,
} from "mui-rte";
import React, { ChangeEvent, useState, useRef } from "react";

/**
 * Important: if the `value` prop changes for a reason other than changes in the editor,
 * this component will not react to the changes and will send new data based on its previous state.
 * Having the component work as a controlled input field causes bugs on cursor position and
 * focus.
 */

interface IRichTextInput extends InputBaseProps {
  className?: string;
  onChange?: (ev: ChangeEvent<HTMLInputElement>) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

const rteContainerStyles = makeStyles((theme) => ({
  regular: {
    position: "relative",
    boxSizing: "border-box",
    padding: 2,
    outline: "none",
  },
  focused: {
    position: "relative",
    boxSizing: "border-box",
    padding: 2,
    outline: "none",
    boxShadow: `inset 0 0 0 2px ${theme.palette.primary.light}`,
  },
}));

const mdToEditorRawContent = (str: unknown) =>
  convertToRaw(stateFromMarkdown(str));

const RichTextInput: React.FC<IRichTextInput> = (props) => {
  // Set the initial `value` prop and ignore updated values to avoid infinite loops
  const [defaultValue] = useState(mdToEditorRawContent(props.value));

  const [focused, setFocused] = useState(false);

  const editorRef = useRef<TMUIRichTextEditorRef>(null);

  const handleFileUpload = async (file: File) => {
    await editorRef.current?.insertAtomicBlockAsync(
      "IMAGE",
      new Promise<TAsyncAtomicBlockResponse>(async (resolve, reject) => {
        const url = await props.onImageUpload(file);
        if (!url) {
          reject();
          return;
        }
        resolve({
          type: "image",
          data: {
            src: url,
            url,
            width: 120,
          },
        });
      }),
      "Uploading now..."
    );
  };

  const classes = rteContainerStyles();

  return (
    <Box tabIndex={-1} className={focused ? classes.focused : classes.regular}>
      <MUIRichTextEditor
        onFocus={() => {
          setFocused(true);
        }}
        onBlur={() => {
          setFocused(false);
        }}
        ref={editorRef}
        defaultValue={JSON.stringify(defaultValue)}
        toolbarButtonSize="small"
        inlineToolbar={true}
        toolbar={false}
        inlineToolbarControls={[
          "bold",
          "italic",
          "underline",
          "link",
          "bulletedList",
        ]}
        label={props.placeholder}
        draftEditorProps={{
          handleDroppedFiles: (_selectionState, files: File[]) => {
            if (props.onImageUpload && files[0]) {
              handleFileUpload(files[0]);
              return "handled";
            }
            return "not-handled";
          },
        }}
        onChange={(newState) => {
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

export default RichTextInput;

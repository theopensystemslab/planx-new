import { InputBaseProps, makeStyles, Box } from "@material-ui/core";
import MUIRichTextEditor from "mui-rte";
import React, { useState, ChangeEvent } from "react";
import { stateToMarkdown } from "draft-js-export-markdown";
import { stateFromMarkdown } from "draft-js-import-markdown";
import { convertToRaw } from "draft-js";

/**
 * Important: if the `value` prop changes for a reason other than changes in the editor,
 * this component will not react to the changes and will send new data based on its previous state.
 * Having the component work as a controlled input field causes bugs on cursor position and
 * focus.
 */

interface IRichTextInput extends InputBaseProps {
  classes?: any;
  className?: string;
  onChange?: (ev: ChangeEvent<HTMLInputElement>) => void;
}

const rteContainerStyles = makeStyles((theme) => ({
  regular: {
    position: "relative",
    boxSizing: "border-box",
    padding: 2,
  },
  focused: {
    position: "relative",
    boxSizing: "border-box",
    padding: 2,
    boxShadow: `inset 0 0 0 2px ${theme.palette.primary.light}`,
  },
}));

const mdToEditorRawContent = (str: unknown) =>
  convertToRaw(stateFromMarkdown(str));

const RichTextInput: React.FC<IRichTextInput> = (props) => {
  // Set the initial `value` prop and ignore updated values to avoid infinite loops
  const [defaultValue] = useState(mdToEditorRawContent(props.value));

  const [focused, setFocused] = useState(false);

  const classes = rteContainerStyles();

  return (
    <Box
      onFocus={() => {
        setFocused(true);
      }}
      onBlur={() => {
        setFocused(false);
      }}
      tabIndex={-1}
      className={focused ? classes.focused : classes.regular}
    >
      <MUIRichTextEditor
        defaultValue={JSON.stringify(defaultValue)}
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

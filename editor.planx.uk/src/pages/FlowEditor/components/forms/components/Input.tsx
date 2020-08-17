import { InputBase, InputBaseProps, makeStyles, Box } from "@material-ui/core";
import classNames from "classnames";
import MUIRichTextEditor from "mui-rte";
import React, { useState, useRef, ChangeEvent } from "react";
import { stateToMarkdown } from "draft-js-export-markdown";
import { stateFromMarkdown } from "draft-js-import-markdown";
import { convertToRaw } from "draft-js";

interface IInput extends InputBaseProps {
  allowFormat?: boolean;
  format?: "large" | "bold" | "data";
  classes?: any;
  className?: string;
  grow?: boolean;
  large?: boolean;
  saveEditor?;
  onChange?: (ev: ChangeEvent) => void;
}

export const inputStyles = makeStyles((theme) => ({
  input: {
    backgroundColor: "#fff",
    fontSize: 15,
    padding: theme.spacing(0, 1.5),
    height: 50,
    "& input": {
      fontWeight: "inherit",
    },
  },
  inputMultiline: {
    height: "auto",
    "& textarea": {
      padding: theme.spacing(1.5, 0),
      lineHeight: 1.6,
    },
  },
  questionInput: {
    backgroundColor: "#fff",
    height: 50,
    fontSize: 25,
    width: "100%",
    fontWeight: 700,
  },
  bold: {
    fontWeight: 700,
  },
  data: {
    backgroundColor: "#fafafa",
  },
  adornedEnd: {
    paddingRight: 2,
  },
  focused: {
    boxShadow: `inset 0 0 0 2px ${theme.palette.primary.light}`,
  },
}));

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

const RichTextInput: React.FC<IInput> = ({ format, allowFormat, ...props }) => {
  // Set the initial `value` prop and ignore updated values to avoid infinite loops
  const initialDefaultValue = useRef(
    convertToRaw(stateFromMarkdown(props.value))
  );

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
        defaultValue={JSON.stringify(initialDefaultValue.current)}
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
          const md = stateToMarkdown(newState.getCurrentContent());
          if (md !== props.value) {
            // Construct and cast as a change event so the component stays compatible with formik helpers
            const changeEvent = ({
              target: {
                name: props.name,
                value: md,
              },
            } as unknown) as ChangeEvent;
            props.onChange(changeEvent);
          }
        }}
        onSave={props.saveEditor}
      />
    </Box>
  );
};

const Input: React.FC<IInput> = (props) => {
  const classes = inputStyles();

  const { format, allowFormat, ...restProps } = props;

  return allowFormat ? (
    <RichTextInput {...props} />
  ) : (
    <InputBase
      className={classNames(
        classes.input,
        format === "large" && classes.questionInput,
        format === "bold" && classes.bold,
        format === "data" && classes.data
      )}
      classes={{
        multiline: classes.inputMultiline,
        adornedEnd: classes.adornedEnd,
        focused: classes.focused,
      }}
      {...restProps}
    />
  );
};
export default Input;

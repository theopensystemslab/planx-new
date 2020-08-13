import { InputBase, InputBaseProps, makeStyles } from "@material-ui/core";
import classNames from "classnames";
import MUIRichTextEditor from "mui-rte";
import React from "react";
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
  changeEditor?;
  saveEditor?;
  onChange?;
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

const Input: React.FC<IInput> = ({ format, allowFormat, ...props }) => {
  const classes = inputStyles();

  const initialDefaultValue = React.useRef(
    convertToRaw(stateFromMarkdown(props.value))
  );

  return allowFormat ? (
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
          props.onChange({
            target: {
              name: props.name,
              value: md,
            },
          });
        }
      }}
      onSave={props.saveEditor}
    />
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
      {...props}
    />
  );
};
export default Input;

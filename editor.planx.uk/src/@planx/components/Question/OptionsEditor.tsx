import React from "react";
import Input from "ui/shared/Input/Input";

import {
  BaseOptionsEditor,
  BaseOptionsEditorProps,
} from "../shared/BaseOptionsEditor";

const QuestionOptionsEditor: React.FC<BaseOptionsEditorProps> = ({
  value,
  onChange,
  showValueField = false,
}) => {
  return (
    <BaseOptionsEditor
      value={value}
      onChange={onChange}
      showValueField={showValueField}
    >
      <Input
        value={value.data.description || ""}
        placeholder="Description"
        multiline
        onChange={(ev) =>
          onChange({
            ...value,
            data: {
              ...value.data,
              description: ev.target.value,
            },
          })
        }
      />
    </BaseOptionsEditor>
  );
};

export default QuestionOptionsEditor;

import React from "react";
import Input from "ui/shared/Input/Input";

import {
  BaseOptionEditor,
  BaseOptionEditorProps,
} from "../shared/BaseOptionsEditor";

const QuestionOptionEditor: React.FC<BaseOptionEditorProps> = ({
  value,
  onChange,
  showValueField = false,
}) => {
  return (
    <BaseOptionEditor
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
    </BaseOptionEditor>
  );
};

export default QuestionOptionEditor;
